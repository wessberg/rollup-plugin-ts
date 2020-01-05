import * as TSModule from "typescript";
import {rollup, RollupOptions, RollupOutput} from "rollup";
import typescriptRollupPlugin from "../../src/plugin/typescript-plugin";
import {HookRecord, InputCompilerOptions, TypescriptPluginOptions} from "../../src/plugin/i-typescript-plugin-options";
import {D_TS_EXTENSION, DECLARATION_MAP_EXTENSION} from "../../src/constant/constant";
import {getRealFileSystem} from "../../src/util/file-system/file-system";
import {TS} from "../../src/type/ts";
import {isAbsolute, nativeDirname, nativeJoin, nativeNormalize, parse} from "../../src/util/path/path-util";

// tslint:disable:no-any

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
	declarations: FileResult[];
	declarationMaps: FileResult[];
}

export interface GenerateRollupBundleOptions {
	dir: string;
	rollupOptions: Partial<RollupOptions>;
	format: "esm" | "cjs";
	tsconfig: Partial<InputCompilerOptions>;
	typescript: typeof TS;
	transpileOnly: boolean;
	debug: TypescriptPluginOptions["debug"];
	hook: Partial<HookRecord>;
	exclude: TypescriptPluginOptions["exclude"];
	transpiler: TypescriptPluginOptions["transpiler"];
	transformers: TypescriptPluginOptions["transformers"];
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
		transpiler = "typescript",
		tsconfig = {},
		format = "esm",
		dir,
		transpileOnly = false,
		typescript = TSModule,
		debug = false,
		hook = {outputPath: path => path}
	}: Partial<GenerateRollupBundleOptions> = {}
): Promise<GenerateRollupBundleResult> {
	const cwd = process.cwd();

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
	const declarationMaps: FileResult[] = [];

	let input: Record<string, string> | string;
	if (entryFiles.length === 1) {
		input = entryFiles[0].fileName;
	} else {
		input = {};

		// Ensure no conflicting chunk names
		let seenNames = new Set<string>();
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
		plugins: [
			{
				name: "VirtualFileResolver",
				resolveId,
				load
			},
			typescriptRollupPlugin({
				transformers,
				transpiler,
				transpileOnly,
				debug,
				typescript,
				exclude: [...exclude, "dist/**/*.*"],
				tsconfig: {
					target: "esnext",
					declaration: true,
					moduleResolution: "node",
					baseUrl: ".",
					...tsconfig
				},
				hook,
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
					readDirectory(
						rootDir: string,
						extensions: readonly string[],
						excludes: readonly string[] | undefined,
						includes: readonly string[],
						depth?: number
					): readonly string[] {
						const nativeNormalizedRootDir = nativeNormalize(rootDir);
						const realResult = typescript.sys.readDirectory(rootDir, extensions, excludes, includes, depth);
						const virtualFiles = files.filter(file => file.fileName.includes(nativeNormalizedRootDir)).map(file => file.fileName);
						return [...new Set([...realResult, ...virtualFiles])];
					}
				}
			}),
			...(rollupOptions.plugins == null ? [] : rollupOptions.plugins)
		]
	});

	const bundle = await result.generate({
		dir,
		format,
		sourcemap: true
	});

	for (const file of bundle.output) {
		if (file.type === "chunk") continue;
		if (file.fileName.endsWith(DECLARATION_MAP_EXTENSION)) {
			declarationMaps.push({
				code: file.source.toString(),
				fileName: file.fileName
			});
		} else if (file.fileName.endsWith(D_TS_EXTENSION)) {
			declarations.push({
				code: file.source.toString(),
				fileName: file.fileName
			});
		}
	}

	return {
		declarations,
		declarationMaps,
		bundle
	};
}
