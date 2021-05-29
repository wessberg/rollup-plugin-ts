import * as TSModule from "typescript";
import {rollup, RollupOptions, RollupOutput, Plugin} from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import fastGlob from "fast-glob";
import FS, {Dirent, existsSync} from "fs";
import typescriptRollupPlugin from "../../src/plugin/typescript-plugin";
import {HookRecord, InputCompilerOptions, TypescriptPluginBabelOptions, TypescriptPluginOptions} from "../../src/plugin/typescript-plugin-options";
import {D_TS_EXTENSION, D_TS_MAP_EXTENSION, TSBUILDINFO_EXTENSION} from "../../src/constant/constant";
import {getRealFileSystem} from "../../src/util/file-system/file-system";
import {TS} from "../../src/type/ts";
import {ensureAbsolute} from "../../src/util/path/path-util";
import {logVirtualFiles} from "../../src/util/logging/log-virtual-files";
import {shouldDebugVirtualFiles} from "../../src/util/is-debug/should-debug";
import path from "crosspath";

export interface ITestFile {
	fileName: string;
	entry: boolean;
	text?: string;
}

export interface FullTestFile extends Omit<ITestFile, "text"> {
	text: string;
}

export type InputTestFile = ITestFile | string;

interface FileResult {
	fileName: string;
	code: string;
}

const EXTENSIONS = ["", ".ts", ".js", ".mjs"];

export interface GenerateRollupBundleResult {
	bundle: RollupOutput;
	js: FileResult[];
	declarations: FileResult[];
	declarationMaps: FileResult[];
	buildInfo: FileResult | undefined;
}

export interface GenerateRollupBundleOptions {
	dir: string;
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
	browserslist: TypescriptPluginOptions["browserslist"];
	chunkFileNames: string;
	entryFileNames: string;
}

/**
 * Prepares a test
 */
export async function generateRollupBundle(
	inputFiles: InputTestFile[] | InputTestFile,
	{
		rollupOptions = {},
		transformers,
		exclude = [],
		browserslist,
		transpiler = "typescript",
		tsconfig = {},
		format = "esm",
		dir,
		prePlugins = [],
		postPlugins = [],
		cwd = process.cwd(),
		transpileOnly = false,
		typescript = TSModule,
		debug = process.env.DEBUG === "true",
		babelConfig,
		chunkFileNames,
		entryFileNames,
		hook = {outputPath: p => p}
	}: Partial<GenerateRollupBundleOptions> = {}
): Promise<GenerateRollupBundleResult> {
	cwd = ensureAbsolute(process.cwd(), cwd);
	const realFileSystem = getRealFileSystem(typescript);

	const files: FullTestFile[] = (Array.isArray(inputFiles) ? inputFiles : [inputFiles])
		.map(file =>
			typeof file === "string"
				? {
						text: file,
						fileName: `auto-generated-${Math.floor(Math.random() * 100000)}.ts`,
						entry: true
				  }
				: "text" in file && file.text != null
				? (file as FullTestFile)
				: {...file, text: realFileSystem.readFile(file.fileName)!}
		)
		.map(file => ({...file, fileName: path.isAbsolute(file.fileName) && existsSync(file.fileName) ? file.fileName : path.native.join(cwd, file.fileName)}));

	const directories = new Set(files.map(file => path.native.normalize(path.native.dirname(file.fileName))));

	let entryFiles = files.filter(file => file.entry);
	const hasMultiEntryPlugin = [...prePlugins, ...postPlugins].some(({name}) => name === "multi-entry");

	if (entryFiles.length === 0 && !hasMultiEntryPlugin) {
		throw new ReferenceError(`No entry could be found`);
	}

	// If there are no entry files, but the multi entry plugin is being used, treat every file as the entry
	else if (entryFiles.length === 0 && hasMultiEntryPlugin) {
		entryFiles = files;
	}

	// Print the virtual file names
	if (shouldDebugVirtualFiles(debug)) {
		logVirtualFiles(files.map(file => path.native.normalize(file.fileName)));
	}

	const resolveId = (fileName: string, parent: string | undefined): string | undefined => {
		const absolute = path.isAbsolute(fileName) ? fileName : path.native.join(parent == null ? "" : path.native.dirname(parent), fileName);
		const filenames = [path.native.normalize(absolute), path.native.join(absolute, "/index")];
		for (const filename of filenames) {
			for (const ext of EXTENSIONS) {
				const withExtension = `${filename}${ext}`;
				const matchedFile = files.find(file => file.fileName === withExtension);
				if (matchedFile != null) {
					return withExtension;
				}
			}
		}
		return undefined;
	};

	const load = (id: string): string | null => {
		const normalized = path.native.normalize(id);
		const matchedFile = files.find(file => file.fileName === normalized);
		return matchedFile == null ? null : matchedFile.text;
	};

	const declarations: FileResult[] = [];
	const js: FileResult[] = [];
	const declarationMaps: FileResult[] = [];
	let buildInfo: FileResult | undefined;

	let input: Record<string, string> | string[] | string;
	if (hasMultiEntryPlugin) {
		input = entryFiles.map(({fileName}) => fileName);
	} else if (entryFiles.length === 1) {
		input = entryFiles[0].fileName;
	} else {
		input = {};

		// Ensure no conflicting chunk names
		const seenNames = new Set<string>();
		for (const entryFile of entryFiles) {
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

			input[candidateName] = entryFile.fileName;
		}
	}

	const result = await rollup({
		input,
		...rollupOptions,
		onwarn: (warning, defaultHandler) => {
			// Eat all irrelevant Rollup warnings (such as 'Generated an empty chunk: "index") while running tests
			if (
				!warning.message.includes("Generated an empty chunk") &&
				!warning.message.includes("but could not be resolved") &&
				!warning.message.includes(`Circular dependency:`) &&
				!warning.message.includes(`Conflicting namespaces:`)
			) {
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
				transformers,
				transpiler,
				transpileOnly,
				debug,
				cwd,
				typescript,
				exclude: [...exclude, "dist/**/*.*", "src/**/*.*", "test/**/*.*"],
				tsconfig:
					typeof tsconfig === "string"
						? tsconfig
						: {
								target: "esnext",
								declaration: true,
								moduleResolution: "node",
								baseUrl: ".",
								...tsconfig
						  },
				hook,
				browserslist,
				fileSystem: {
					...realFileSystem,
					useCaseSensitiveFileNames: true,
					readFile: fileName => {
						const normalized = path.native.normalize(fileName);
						const absoluteFileName = path.isAbsolute(normalized) ? normalized : path.native.join(cwd, normalized);

						const file = files.find(currentFile => currentFile.fileName === absoluteFileName);
						if (file != null) return file.text;
						return typescript.sys.readFile(absoluteFileName);
					},
					writeFile(fileName, text) {
						extraFiles.push({
							type: "asset",
							fileName: path.relative(dir ?? cwd, fileName),
							source: text
						});
					},
					fileExists: fileName => {
						const normalized = path.native.normalize(fileName);
						const absoluteFileName = path.isAbsolute(normalized) ? normalized : path.native.join(cwd, normalized);
						if (files.some(file => file.fileName === absoluteFileName)) {
							return true;
						}
						return typescript.sys.fileExists(absoluteFileName);
					},
					directoryExists: dirName => {
						const normalized = path.native.normalize(dirName);
						if (directories.has(normalized)) return true;
						return typescript.sys.directoryExists(normalized);
					},
					realpath(p: string): string {
						return path.native.normalize(p);
					},
					readDirectory(rootDir: string, extensions: readonly string[], excludes: readonly string[] | undefined, includes: readonly string[], depth?: number): readonly string[] {
						const nativeNormalizedRootDir = path.native.normalize(rootDir);
						const realResult = typescript.sys.readDirectory(rootDir, extensions, excludes, includes, depth);

						// Making the glob filter of the virtual file system to match the behavior of TypeScript as close as possible.
						const virtualFiles = fastGlob
							.sync([...includes], {
								cwd: nativeNormalizedRootDir,
								ignore: [...(excludes ?? [])],
								fs: {
									readdirSync: ((p: string, {withFileTypes}: {withFileTypes?: boolean}) => {
										p = path.native.normalize(p);

										return files
											.filter(file => file.fileName.startsWith(p))
											.map(file => {
												const fileName = file.fileName.slice(
													p.length + 1,
													file.fileName.includes(path.sep, p.length + 1) ? file.fileName.indexOf(path.sep, p.length + 1) : undefined
												);

												const isDirectory = !file.fileName.endsWith(fileName);
												const isFile = file.fileName.endsWith(fileName);

												return withFileTypes === true
													? ({
															name: fileName,
															isDirectory() {
																return isDirectory;
															},
															isFile() {
																return isFile;
															},
															isSymbolicLink() {
																return false;
															}
													  } as Partial<Dirent>)
													: fileName;
											});
									}) as unknown as typeof FS.readdirSync
								}
							})
							.map(file => path.native.join(nativeNormalizedRootDir, file));

						return [...new Set([...realResult, ...virtualFiles])].map(path.native.normalize);
					},

					getDirectories(p: string): string[] {
						return typescript.sys.getDirectories(p).map(path.native.normalize);
					}
				},
				babelConfig
			}),
			...(rollupOptions.plugins == null ? [] : rollupOptions.plugins),
			...postPlugins
		]
	});

	const extraFiles: {type: "chunk" | "asset"; source: string; fileName: string}[] = [];
	const bundle = await result.generate({
		dir,
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
