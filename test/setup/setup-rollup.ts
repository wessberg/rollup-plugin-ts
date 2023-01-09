import {InputPluginOption, OutputOptions, Plugin, rollup, RollupBuild, RollupCache, RollupOptions, RollupOutput} from "rollup";
// import commonjs from "@rollup/plugin-commonjs";
import typescriptRollupPlugin from "../../src/plugin/typescript-plugin.js";
import {HookRecord, InputCompilerOptions, TypescriptPluginOptions} from "../../src/plugin/typescript-plugin-options.js";
import {
	D_CTS_EXTENSION,
	D_CTS_MAP_EXTENSION,
	D_MTS_EXTENSION,
	D_MTS_MAP_EXTENSION,
	D_TS_EXTENSION,
	D_TS_MAP_EXTENSION,
	TSBUILDINFO_EXTENSION
} from "../../src/constant/constant.js";
import {TS} from "../../src/type/ts.js";
import {logVirtualFiles} from "../../src/util/logging/log-virtual-files.js";
import {shouldDebugVirtualFiles} from "../../src/util/is-debug/should-debug.js";
import path from "crosspath";
import {builtinModules} from "module";
import {createTestSetup} from "./test-setup.js";
import {TestFile} from "./test-file.js";
import {MaybeArray, PartialExcept} from "helpertypes";
import {FileResult} from "./test-result.js";
import {removeSearchPathFromFilename, setExtension} from "../../src/util/path/path-util.js";
import { ensureArray } from "../../src/util/ensure-array/ensure-array.js";
import { isPromise } from "../../src/util/object/object-util.js";
import { isDefined } from "../../src/util/is-defined/is-defined.js";

export interface GenerateRollupBundleResult {
	bundle: RollupOutput;
	js: FileResult[];
	declarations: FileResult[];
	declarationMaps: FileResult[];
	buildInfo: FileResult | undefined;
}

export interface GenerateRollupBundleOptions {
	dist: string;
	loadBabelHelpers: boolean;
	loadSwcHelpers: boolean;
	rollupOptions: Omit<Partial<RollupOptions>, "output"> & {output?: OutputOptions};
	format: "esm" | "cjs";
	tsconfig: Partial<InputCompilerOptions> | string;
	typescript: typeof TS;
	transpileOnly: boolean;
	cwd: TypescriptPluginOptions["cwd"];
	debug: TypescriptPluginOptions["debug"];
	hook: Partial<HookRecord>;
	prePlugins: Plugin[];
	postPlugins: Plugin[];
	exclude: TypescriptPluginOptions["exclude"];
	transpiler: TypescriptPluginOptions["transpiler"];
	transformers: TypescriptPluginOptions["transformers"];
	babelConfig: TypescriptPluginOptions["babelConfig"];
	swcConfig: TypescriptPluginOptions["swcConfig"];
	browserslist: TypescriptPluginOptions["browserslist"];
	chunkFileNames: string;
	entryFileNames: string;
	runCachedBuild: boolean;
}

/**
 * Prepares a test
 */
export async function generateRollupBundle(
	inputFiles: MaybeArray<TestFile>,
	{
		rollupOptions = {},
		format = "esm",
		runCachedBuild = false,
		prePlugins = [],
		postPlugins = [],
		entryFileNames,
		chunkFileNames,
		transformers,
		browserslist,
		babelConfig,
		swcConfig,
		...options
	}: PartialExcept<GenerateRollupBundleOptions, "typescript">
): Promise<GenerateRollupBundleResult> {
	let {
		context,
		fileStructure: {entries, userFiles},
		fileSystem
	} = createTestSetup(inputFiles, options);

	async function flattenPlugins (plugins: InputPluginOption|undefined): Promise<Plugin[]> {
		const flattened: Plugin[] = [];
		const awaitedPlugins = ensureArray(isPromise(plugins) ? await plugins : plugins).filter(isDefined);
		for (const awaitedPlugin of awaitedPlugins) {
			if (awaitedPlugin == null || awaitedPlugin === false) continue;
			if (Array.isArray(awaitedPlugin) || isPromise(awaitedPlugin)) {
				flattened.push(...(await flattenPlugins(awaitedPlugin)));
			} else {
				flattened.push(awaitedPlugin);
			}
		}
		return flattened;
	}

	const hasMultiEntryPlugin = [...prePlugins, ...postPlugins].some(({name}) => name === "multi-entry");

	if (entries.length === 0 && !hasMultiEntryPlugin) {
		throw new ReferenceError(`No entry could be found`);
	}

	// If there are no entry files, but the multi entry plugin is being used, treat every non-internal file as the entry
	else if (entries.length === 0 && hasMultiEntryPlugin) {
		entries = userFiles;
	}

	// Print the virtual file names
	if (shouldDebugVirtualFiles(context.debug)) {
		logVirtualFiles(userFiles.map(file => path.native.normalize(file.fileName)));
	}

	const resolveId = (fileName: string, parent: string | undefined): string | null => {
		const normalizedFileName = path.normalize(fileName);
		const normalizedParent = parent == null ? undefined : path.normalize(parent);
		const absolute = path.isAbsolute(normalizedFileName) ? normalizedFileName : path.join(normalizedParent == null ? "" : path.dirname(normalizedParent), normalizedFileName);

		for (const currentAbsolute of [absolute, path.join(absolute, "/index")]) {
			for (const ext of ["", ".ts", ".mts", ".cts", ".js", ".mjs", ".cjs"]) {
				for (const withExtension of [`${currentAbsolute}${ext}`, setExtension(currentAbsolute, ext)]) {
					const matchedFile = userFiles.find(file => path.normalize(file.fileName) === path.normalize(withExtension));

					if (matchedFile != null) {
						return path.native.normalize(withExtension);
					}
				}
			}
		}
		return null;
	};

	const load = (id: string): string | null => {
		const normalized = removeSearchPathFromFilename(path.normalize(id));
		const matchedFile = userFiles.find(file => path.normalize(file.fileName) === path.normalize(normalized));

		return matchedFile?.text ?? null;
	};

	const declarations: FileResult[] = [];
	const js: FileResult[] = [];
	const declarationMaps: FileResult[] = [];
	let buildInfo: FileResult | undefined;

	let input: Record<string, string> | string[] | string;
	if (hasMultiEntryPlugin) {
		input = entries.map(({fileName}) => path.native.normalize(fileName));
	} else if (entries.length === 1) {
		input = path.native.normalize(entries[0].fileName);
	} else {
		input = {};

		// Ensure no conflicting chunk names
		const seenNames = new Set<string>();
		for (const entryFile of entries) {
			let candidateName = path.parse(entryFile.fileName).name;
			let offset = 0;
			if (!seenNames.has(candidateName)) {
				seenNames.add(candidateName);
			} else {
				candidateName = `${candidateName}-${++offset}`;
				while (true) {
					if (seenNames.has(candidateName)) {
						candidateName = `${candidateName.slice(0, candidateName.length - 2)}-${++offset}`;
					} else {
						seenNames.add(candidateName);
						break;
					}
				}
			}

			input[candidateName] = path.native.normalize(entryFile.fileName);
		}
	}

	let cache: RollupCache | undefined;
	let result: RollupBuild | undefined;

	const plugins = await flattenPlugins(rollupOptions.plugins);

	while (true) {
		result = await rollup({
			input,
			cache,
			external: builtinModules,
			...rollupOptions,
			onwarn: (warning, defaultHandler) => {
				// Eat all irrelevant Rollup warnings (such as 'Generated an empty chunk: "index") while running tests
				if (!warning.message.includes("Generated an empty chunk") && !warning.message.includes(`Circular dependency:`) && !warning.message.includes(`Conflicting namespaces:`)) {
					defaultHandler(warning);
				}
			},
			plugins: [
				{
					name: "VirtualFileResolver",
					resolveId,
					load
				},
				// commonjs(),
				...prePlugins,
				typescriptRollupPlugin({
					...context,
					fileSystem,
					transformers,
					browserslist,
					babelConfig,
					swcConfig
				}),
				...(plugins ?? []),
				...postPlugins
			]
		});

		if (runCachedBuild && cache == null) {
			cache = result.cache;

			// Run again, this time with caching
			continue;
		} else {
			break;
		}
	}

	const bundle = await result.generate({
		...(rollupOptions.output?.file == null ? {dir: context.dist} : {}),
		format,
		sourcemap: false,
		...rollupOptions.output,
		...(entryFileNames == null ? {} : {entryFileNames}),
		...(chunkFileNames == null ? {} : {chunkFileNames})
	});

	for (const file of bundle.output) {
		if (file.type === "chunk" && "code" in file) {
			js.push({
				code: file.code,
				fileName: file.fileName
			});
		} else {
			if (file.fileName.endsWith(D_TS_MAP_EXTENSION) || file.fileName.endsWith(D_MTS_MAP_EXTENSION) || file.fileName.endsWith(D_CTS_MAP_EXTENSION)) {
				declarationMaps.push({
					code: file.source.toString(),
					fileName: file.fileName
				});
			} else if (file.fileName.endsWith(D_TS_EXTENSION) || file.fileName.endsWith(D_MTS_EXTENSION) || file.fileName.endsWith(D_CTS_EXTENSION)) {
				declarations.push({
					code: file.source.toString(),
					fileName: file.fileName
				});
			} else if (file.fileName.endsWith(TSBUILDINFO_EXTENSION)) {
				buildInfo = {
					code: file.source.toString(),
					fileName: file.fileName
				};
			}
		}
	}

	return {
		js,
		declarations,
		declarationMaps,
		bundle,
		buildInfo
	};
}
