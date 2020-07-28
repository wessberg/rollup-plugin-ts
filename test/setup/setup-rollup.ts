import * as TSModule from "typescript";
import {rollup, RollupOptions, RollupOutput, Plugin} from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import fastGlob from "fast-glob";
import FS, {Dirent} from "fs";
import Path from "path";
import typescriptRollupPlugin from "../../src/plugin/typescript-plugin";
import {HookRecord, InputCompilerOptions, TypescriptPluginBabelOptions, TypescriptPluginOptions} from "../../src/plugin/i-typescript-plugin-options";
import {D_TS_EXTENSION, D_TS_MAP_EXTENSION, TSBUILDINFO_EXTENSION} from "../../src/constant/constant";
import {getRealFileSystem} from "../../src/util/file-system/file-system";
import {TS} from "../../src/type/ts";
import {ensureAbsolute, isAbsolute, nativeDirname, nativeJoin, nativeNormalize, parse, relative} from "../../src/util/path/path-util";
import {logVirtualFiles} from "../../src/util/logging/log-virtual-files";
import {shouldDebugVirtualFiles} from "../../src/util/is-debug/should-debug";

export interface ITestFile {
	fileName: string;
	text: string;
	entry: boolean;
}

export type TestFile = ITestFile | string;

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
	inputFiles: TestFile[] | TestFile,
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
		hook = {outputPath: path => path}
	}: Partial<GenerateRollupBundleOptions> = {}
): Promise<GenerateRollupBundleResult> {
	cwd = ensureAbsolute(process.cwd(), cwd);
	const files: ITestFile[] = (Array.isArray(inputFiles) ? inputFiles : [inputFiles])
		.map(file =>
			typeof file === "string"
				? {
						text: file,
						fileName: `auto-generated-${Math.floor(Math.random() * 100000)}.ts`,
						entry: true
				  }
				: file
		)
		.map(file => ({...file, fileName: nativeJoin(cwd, file.fileName)}));

	const directories = new Set(files.map(file => nativeNormalize(nativeDirname(file.fileName))));

	const entryFiles = files.filter(file => file.entry);
	if (entryFiles.length === 0) {
		throw new ReferenceError(`No entry could be found`);
	}

	// Print the virtual file names
	if (shouldDebugVirtualFiles(debug)) {
		logVirtualFiles(files.map(file => nativeNormalize(file.fileName)));
	}

	const resolveId = (fileName: string, parent: string | undefined): string | undefined => {
		const absolute = isAbsolute(fileName) ? fileName : nativeJoin(parent == null ? "" : nativeDirname(parent), fileName);
		const filenames = [nativeNormalize(absolute), nativeJoin(absolute, "/index")];
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
		const normalized = nativeNormalize(id);
		const matchedFile = files.find(file => file.fileName === normalized);
		return matchedFile == null ? null : matchedFile.text;
	};

	const declarations: FileResult[] = [];
	const js: FileResult[] = [];
	const declarationMaps: FileResult[] = [];
	let buildInfo: FileResult | undefined;

	let input: Record<string, string> | string;
	if (entryFiles.length === 1) {
		input = entryFiles[0].fileName;
	} else {
		input = {};

		// Ensure no conflicting chunk names
		const seenNames = new Set<string>();
		for (const entryFile of entryFiles) {
			let candidateName = parse(entryFile.fileName).name;
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
				exclude: [...exclude, "dist/**/*.*", "src/**/*.*"],
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
					...getRealFileSystem(typescript),
					useCaseSensitiveFileNames: true,
					readFile: fileName => {
						const normalized = nativeNormalize(fileName);
						const absoluteFileName = isAbsolute(normalized) ? normalized : nativeJoin(cwd, normalized);

						const file = files.find(currentFile => currentFile.fileName === absoluteFileName);
						if (file != null) return file.text;
						return typescript.sys.readFile(absoluteFileName);
					},
					writeFile(fileName, text) {
						extraFiles.push({
							type: "asset",
							fileName: relative(dir ?? cwd, fileName),
							source: text
						});
					},
					fileExists: fileName => {
						const normalized = nativeNormalize(fileName);
						const absoluteFileName = isAbsolute(normalized) ? normalized : nativeJoin(cwd, normalized);
						if (files.some(file => file.fileName === absoluteFileName)) {
							return true;
						}
						return typescript.sys.fileExists(absoluteFileName);
					},
					directoryExists: dirName => {
						const normalized = nativeNormalize(dirName);
						if (directories.has(normalized)) return true;
						return typescript.sys.directoryExists(normalized);
					},
					realpath(path: string): string {
						return nativeNormalize(path);
					},
					readDirectory(rootDir: string, extensions: readonly string[], excludes: readonly string[] | undefined, includes: readonly string[], depth?: number): readonly string[] {
						const nativeNormalizedRootDir = nativeNormalize(rootDir);
						const realResult = typescript.sys.readDirectory(rootDir, extensions, excludes, includes, depth);

						// Making the glob filter of the virtual file system to match the behavior of TypeScript as close as possible.
						const virtualFiles = fastGlob
							.sync([...includes], {
								cwd: nativeNormalizedRootDir,
								ignore: [...(excludes ?? [])],
								fs: {
									readdirSync: (((path: string, {withFileTypes}: {withFileTypes?: boolean}) => {
										path = nativeNormalize(path);

										return files
											.filter(file => file.fileName.startsWith(path))
											.map(file => {
												const fileName = file.fileName.slice(
													path.length + 1,
													file.fileName.includes(Path.sep, path.length + 1) ? file.fileName.indexOf(Path.sep, path.length + 1) : undefined
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
									}) as unknown) as typeof FS.readdirSync
								}
							})
							.map(file => nativeJoin(nativeNormalizedRootDir, file));

						return [...new Set([...realResult, ...virtualFiles])].map(nativeNormalize);
					},

					getDirectories(path: string): string[] {
						return typescript.sys.getDirectories(path).map(nativeNormalize);
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
