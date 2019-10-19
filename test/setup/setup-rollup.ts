import {dirname, isAbsolute, join, normalize} from "path";
import {rollup, RollupOptions, RollupOutput} from "rollup";
import typescriptRollupPlugin from "../../src/plugin/typescript-plugin";
import {PathLike} from "fs";
import {CompilerOptions, sys} from "typescript";
import {REAL_FILE_SYSTEM} from "../../src/util/file-system/file-system";
import {DECLARATION_EXTENSION, DECLARATION_MAP_EXTENSION} from "../../src/constant/constant";
import {HookRecord} from "../../src/plugin/i-typescript-plugin-options";

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
	tsconfig: Partial<Record<keyof CompilerOptions, string | number | boolean>>;
	hook?: HookRecord;
}

/**
 * Prepares a test
 * @param {ITestFile[]|TestFile} inputFiles
 * @param {GenerateRollupBundleOptions} options
 * @returns {Promise<GenerateRollupBundleResult>}
 */
export async function generateRollupBundle(
	inputFiles: TestFile[] | TestFile,
	{rollupOptions = {}, tsconfig = {}, hook = {outputPath: path => path}}: Partial<GenerateRollupBundleOptions> = {}
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

	const directories = new Set(files.map(file => dirname(file.fileName)));

	const entryFile = files.find(file => file.entry);
	if (entryFile == null) {
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
		const matchedFile = files.find(file => file.fileName === id);
		return matchedFile == null ? null : matchedFile.text;
	};

	const declarations: FileResult[] = [];
	const declarationMaps: FileResult[] = [];

	const result = await rollup({
		input: entryFile.fileName,
		...rollupOptions,
		plugins: [
			{
				name: "VirtualFileResolver",
				resolveId,
				load
			},
			typescriptRollupPlugin({
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
						const file = files.find(currentFile => currentFile.fileName === fileName);
						if (file != null) return file.text;
						return sys.readFile(fileName);
					},
					fileExists: fileName => {
						if (files.some(file => file.fileName === fileName)) return true;
						return sys.fileExists(fileName);
					},
					directoryExists: dirName => {
						if (directories.has(dirName)) return true;
						return sys.directoryExists(dirName);
					},
					writeFileSync<T>(path: PathLike, data: T): void {
						if (typeof path !== "string" || typeof data !== "string") return;
						if (path.endsWith(DECLARATION_MAP_EXTENSION)) {
							declarationMaps.push({
								fileName: path,
								code: data
							});
						} else if (path.endsWith(DECLARATION_EXTENSION)) {
							declarations.push({
								fileName: path,
								code: data
							});
						}
					},
					realpath(path: string): string {
						return path;
					}
				}
			}),
			...(rollupOptions.plugins == null ? [] : rollupOptions.plugins)
		]
	});
	return {
		declarations,
		declarationMaps,
		bundle: await result.generate({
			format: "esm",
			sourcemap: true
		})
	};
}
