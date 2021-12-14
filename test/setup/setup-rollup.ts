import {Plugin, rollup, RollupOptions, RollupOutput} from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import typescriptRollupPlugin from "../../src/plugin/typescript-plugin";
import {HookRecord, InputCompilerOptions, TypescriptPluginBabelOptions, TypescriptPluginOptions, TypescriptPluginSwcOptions} from "../../src/plugin/typescript-plugin-options";
import {D_TS_EXTENSION, D_TS_MAP_EXTENSION, TSBUILDINFO_EXTENSION} from "../../src/constant/constant";
import {TS} from "../../src/type/ts";
import {logVirtualFiles} from "../../src/util/logging/log-virtual-files";
import {shouldDebugVirtualFiles} from "../../src/util/is-debug/should-debug";
import path from "crosspath";
import {createTestSetup} from "./test-setup";
import {TestFile} from "./test-file";
import {MaybeArray, PartialExcept} from "helpertypes";
import {FileResult} from "./test-result";

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
	rollupOptions: Partial<RollupOptions>;
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
	babelConfig: TypescriptPluginBabelOptions["babelConfig"];
	swcConfig: TypescriptPluginSwcOptions["swcConfig"];
	browserslist: TypescriptPluginOptions["browserslist"];
	chunkFileNames: string;
	entryFileNames: string;
}

/**
 * Prepares a test
 */
export async function generateRollupBundle(
	inputFiles: MaybeArray<TestFile>,
	{
		rollupOptions = {},
		format = "esm",
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
			for (const ext of ["", ".ts", ".js", ".mjs"]) {
				const withExtension = `${currentAbsolute}${ext}`;
				const matchedFile = userFiles.find(file => path.normalize(file.fileName) === path.normalize(withExtension));
				if (matchedFile != null) return path.native.normalize(withExtension);
			}
		}
		return null;
	};

	const load = (id: string): string | null => {
		const normalized = path.normalize(id);
		const matchedFile = userFiles.find(file => path.normalize(file.fileName) === path.normalize(normalized));
		return matchedFile == null ? null : matchedFile.text;
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

	const result = await rollup({
		input,
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
			commonjs(),
			...prePlugins,
			typescriptRollupPlugin({
				...context,
				fileSystem,
				transformers,
				browserslist,
				babelConfig,
				swcConfig
			}),
			...(rollupOptions.plugins == null ? [] : rollupOptions.plugins),
			...postPlugins
		]
	});

	const extraFiles: {type: "chunk" | "asset"; source: string; fileName: string}[] = [];
	const bundle = await result.generate({
		dir: context.dist,
		format,
		sourcemap: true,
		...(entryFileNames == null ? {} : {entryFileNames}),
		...(chunkFileNames == null ? {} : {chunkFileNames})
	});

	for (const file of [...bundle.output, ...extraFiles]) {
		if (file.type === "chunk" && "code" in file) {
			js.push({
				code: file.code,
				fileName: file.fileName
			});
		} else {
			if (file.fileName.endsWith(D_TS_MAP_EXTENSION)) {
				declarationMaps.push({
					code: file.source.toString(),
					fileName: file.fileName
				});
			} else if (file.fileName.endsWith(D_TS_EXTENSION)) {
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
