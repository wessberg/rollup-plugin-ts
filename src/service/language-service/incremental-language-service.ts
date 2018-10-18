import {CompilerOptions, CustomTransformers, getDefaultLibFileName, IScriptSnapshot, LanguageServiceHost, ScriptKind, ScriptSnapshot, sys} from "typescript";
import {join} from "path";
import {getNewLineCharacter} from "../../util/get-new-line-character/get-new-line-character";
import {fileExistsSync, IS_FILE_SYSTEM_CASE_SENSITIVE, readFileSync} from "../../util/file-system/file-system";
import {ILanguageServiceOptions} from "./i-language-service-options";
import {IFile, IFileInput} from "./i-file";
import {getScriptKindFromPath} from "../../util/get-script-kind-from-path/get-script-kind-from-path";
import {sync} from "find-up";
import {DEFAULT_LIB_NAMES} from "../../constant/constant";
import {ensureAbsolute, isInternalFile, setExtension} from "../../util/path/path-util";

// tslint:disable:no-any

/**
 * An implementation of a LanguageService for Typescript
 */
export class IncrementalLanguageService implements LanguageServiceHost {

	/**
	 * The Set of all files that has been added manually via the public API
	 * @type {Set<string>}
	 */
	public publicFiles: Set<string> = new Set();
	/**
	 * The nearest Typescript Lib directory from the given cwd
	 * @type {string | null}
	 */
	private readonly LIB_DIRECTORY = sync("node_modules/typescript/lib", {cwd: this.options.cwd});
	/**
	 * A Map between file names and their IFiles
	 * @type {Map<string, IFile>}
	 */
	private readonly files: Map<string, IFile> = new Map();

	constructor (private readonly options: ILanguageServiceOptions) {
		this.addDefaultLibs();
		this.addDefaultFileNames();
	}

	/**
	 * Returns true if the LanguageServiceHost has the given file
	 * @param {string} fileName
	 * @returns {boolean}
	 */
	public hasFile (fileName: string): boolean {
		return this.files.has(fileName);
	}

	/**
	 * Gets the fileName, if any, that is has been added to the LanguageServiceHost and looks like the given one.
	 * For example, if a file without any file extension is provided as input, any file that has an extension but the
	 * same base name will be returned
	 * @param {string} fileName
	 * @returns {string | undefined}
	 */
	public getClosestFileName (fileName: string): string|undefined {
		const absolute = ensureAbsolute(this.options.cwd, fileName);

		if (this.hasFile(fileName)) return fileName;
		if (this.hasFile(absolute)) return absolute;
		for (const extension of this.options.supportedExtensions) {
			const withExtension = setExtension(fileName, extension);
			const absoluteWithExtension = ensureAbsolute(this.options.cwd, withExtension);
			if (this.hasFile(withExtension)) return withExtension;
			if (this.hasFile(absoluteWithExtension)) return absoluteWithExtension;
		}
		return undefined;
	}

	/**
	 * Adds a File to the CompilerHost
	 * @param {IFile} file
	 * @param {boolean} internal
	 */
	public addFile (file: IFileInput, internal: boolean = false): void {
		const existing = this.files.get(file.file);

		// Don't proceed if the file contents are completely unchanged
		if (existing != null && existing.code === file.code) return;

		this.files.set(file.file, {
			...file,
			scriptKind: getScriptKindFromPath(file.file),
			snapshot: ScriptSnapshot.fromString(file.code),
			version: existing != null ? existing.version + 1 : 0
		});

		if (!internal) {
			// Add the file to the Set of files that has been added manually by the user
			this.publicFiles.add(file.file);
		}

		// Remove the file from the emit cache
		this.options.emitCache.delete(file.file);
	}

	/**
	 * Deletes a file from the LanguageService
	 * @param {string} fileName
	 * @returns {boolean}
	 */
	public deleteFile (fileName: string): boolean {
		const filesResult = this.files.delete(fileName);
		const publicFilesResult = this.publicFiles.delete(fileName);
		const cacheResult = this.options.emitCache.delete(fileName);
		return filesResult || publicFilesResult || cacheResult;
	}

	/**
	 * Returns true if the given file exists
	 * @param {string} fileName
	 * @returns {boolean}
	 */
	public fileExists (fileName: string): boolean {
		// Check if the file exists cached
		if (this.files.has(fileName)) return true;

		// Otherwise, check if it exists on disk
		return fileExistsSync(fileName);

	}

	/**
	 * Gets the current directory
	 * @returns {string}
	 */
	public getCurrentDirectory (): string {
		return this.options.cwd;
	}

	/**
	 * Reads the given file
	 * @param {string} fileName
	 * @returns {string | undefined}
	 */
	public readFile (fileName: string): string|undefined {

		// Check if the file exists within the cached files and return it if so
		const result = this.files.get(fileName);
		if (result != null) return result.code;

		// Otherwise, try to properly resolve the file
		if (!fileExistsSync(fileName)) return undefined;
		return readFileSync(fileName).toString();
	}

	/**
	 * Gets the real path for the given path. Meant to resolve symlinks
	 * @param {string} path
	 * @returns {string}
	 */
	public realpath (path: string): string {
		return path;
	}

	/**
	 * Gets the default lib file name based on the given CompilerOptions
	 * @param {CompilerOptions} options
	 * @returns {string}
	 */
	public getDefaultLibFileName (options: CompilerOptions): string {
		return getDefaultLibFileName(options);
	}

	/**
	 * Gets the newline to use
	 * @returns {string}
	 */
	public getNewLine (): string {
		return this.options.parsedCommandLine.options.newLine != null
			? getNewLineCharacter(this.options.parsedCommandLine.options.newLine)
			: sys.newLine;
	}

	/**
	 * Returns true if file names should be treated as case-sensitive
	 * @returns {boolean}
	 */
	public useCaseSensitiveFileNames (): boolean {
		return IS_FILE_SYSTEM_CASE_SENSITIVE;
	}

	/**
	 * Gets the CompilerOptions provided in the constructor
	 * @returns {CompilerOptions}
	 */
	public getCompilationSettings (): CompilerOptions {
		return this.options.parsedCommandLine.options;
	}

	/**
	 * Gets the Custom Transformers
	 * @returns {CustomTransformers | undefined}
	 */
	public getCustomTransformers (): CustomTransformers|undefined {
		return this.options.transformers;
	}

	/**
	 * Gets all Script file names
	 * @returns {string[]}
	 */
	public getScriptFileNames (): string[] {
		return [...this.files.keys()];
	}

	/**
	 * Gets the ScriptKind for the given file name
	 * @param {string} fileName
	 * @returns {ScriptKind}
	 */
	public getScriptKind (fileName: string): ScriptKind {
		return this.assertHasFileName(fileName).scriptKind;
	}

	/**
	 * Gets a ScriptSnapshot for the given file
	 * @param {string} fileName
	 * @returns {IScriptSnapshot | undefined}
	 */
	public getScriptSnapshot (fileName: string): IScriptSnapshot|undefined {
		return this.assertHasFileName(fileName).snapshot;
	}

	/**
	 * Gets the Script version for the given file name
	 * @param {string} fileName
	 * @returns {string}
	 */
	public getScriptVersion (fileName: string): string {
		return String(this.assertHasFileName(fileName).version);
	}

	/**
	 * Gets the canonical filename for the given file
	 * @param {string} fileName
	 * @returns {string}
	 */
	public getCanonicalFileName (fileName: string): string {
		return this.useCaseSensitiveFileNames() ? fileName : fileName.toLowerCase();
	}

	/**
	 * Adds all default lib files to the LanguageService
	 */
	private addDefaultLibs (): void {
		DEFAULT_LIB_NAMES.forEach(libName => {
			if (this.LIB_DIRECTORY == null) return;

			this.addFile({
				file: libName,
				code: readFileSync(join(this.LIB_DIRECTORY, libName)).toString()
			}, true);
		});
	}

	/**
	 * Adds all default declaration files to the LanguageService
	 */
	private addDefaultFileNames (): void {
		this.options.parsedCommandLine.fileNames.forEach(file => {

			this.addFile({
				file: file,
				code: readFileSync(ensureAbsolute(this.options.cwd, file)).toString()
			}, true);
		});
	}

	/**
	 * Asserts that the given file name exists within the LanguageServiceHost
	 * @param {string} fileName
	 * @returns {IFile}
	 */
	private assertHasFileName (fileName: string): IFile {
		if (!this.files.has(fileName)) {

			// If the file exists on disk, add it
			if (fileExistsSync(fileName)) {
				this.addFile({file: fileName, code: readFileSync(fileName).toString()}, isInternalFile(fileName));
			} else {
				throw new ReferenceError(`The given file: '${fileName}' doesn't exist!`);
			}
		}
		return this.files.get(fileName)!;
	}
}