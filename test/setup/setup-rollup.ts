import {dirname, isAbsolute, join, normalize, parse} from "path";
import {rollup, RollupOptions, RollupOutput} from "rollup";
import typescriptRollupPlugin from "../../src/plugin/typescript-plugin";
import {sys} from "typescript";
import {REAL_FILE_SYSTEM} from "../../src/util/file-system/file-system";
import {HookRecord, InputCompilerOptions} from "../../src/plugin/i-typescript-plugin-options";
import {DECLARATION_EXTENSION, DECLARATION_MAP_EXTENSION} from "../../src/constant/constant";

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
	rollupOptions: Partial<RollupOptions>;
	tsconfig: Partial<InputCompilerOptions>;
	transpileOnly: boolean;
	debug: boolean;
	hook?: Partial<HookRecord>;
}

/**
 * Prepares a test
 * @param {ITestFile[]|TestFile} inputFiles
 * @param {GenerateRollupBundleOptions} options
 * @returns {Promise<GenerateRollupBundleResult>}
 */
export async function generateRollupBundle(
	inputFiles: TestFile[] | TestFile,
	{
		rollupOptions = {},
		tsconfig = {},
		transpileOnly = false,
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
		.map(file => ({...file, fileName: join(cwd, file.fileName)}));

	const directories = new Set(files.map(file => normalize(dirname(file.fileName))));

	const entryFiles = files.filter(file => file.entry);
	if (entryFiles.length === 0) {
		throw new ReferenceError(`No entry could be found`);
	}

	const resolveId = (fileName: string, parent: string | undefined): string | undefined => {
		const absolute = isAbsolute(fileName) ? fileName : join(parent == null ? "" : dirname(parent), fileName);
		const filenames = [normalize(absolute), join(absolute, "/index")];
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
		const normalized = normalize(id);
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
		for (const entryFile of entryFiles) {
			input[parse(entryFile.fileName).name] = entryFile.fileName;
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
				transpileOnly,
				debug,
				tsconfig: {
					target: "esnext",
					declaration: true,
					moduleResolution: "node",
					baseUrl: ".",
					...tsconfig
				},
				hook,
				fileSystem: {
					...REAL_FILE_SYSTEM,
					useCaseSensitiveFileNames: true,
					readFile: fileName => {
						const normalized = normalize(fileName);
						const absoluteFileName = isAbsolute(normalized) ? normalized : join(cwd, normalized);
						const file = files.find(currentFile => currentFile.fileName === absoluteFileName);
						if (file != null) return file.text;
						return sys.readFile(absoluteFileName);
					},
					fileExists: fileName => {
						const normalized = normalize(fileName);
						const absoluteFileName = isAbsolute(normalized) ? normalized : join(cwd, normalized);
						if (files.some(file => file.fileName === absoluteFileName)) {
							return true;
						}
						return sys.fileExists(absoluteFileName);
					},
					directoryExists: dirName => {
						const normalized = normalize(dirName);
						if (directories.has(normalized)) return true;
						return sys.directoryExists(normalized);
					},
					realpath(path: string): string {
						return normalize(path);
					}
				}
			}),
			...(rollupOptions.plugins == null ? [] : rollupOptions.plugins)
		]
	});

	const bundle = await result.generate({
		format: "esm",
		sourcemap: true
	});

	for (const file of bundle.output) {
		if (file.type === "chunk") continue;
		if (file.fileName.endsWith(DECLARATION_MAP_EXTENSION)) {
			declarationMaps.push({
				code: file.source.toString(),
				fileName: file.fileName
			});
		} else if (file.fileName.endsWith(DECLARATION_EXTENSION)) {
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
