import {existsSync} from "fs";
import {isAbsolute, join} from "path";
import {CompilerOptions, createDocumentRegistry, createLanguageService, createProgram, Diagnostic, getDefaultLibFilePath, getPreEmitDiagnostics, IScriptSnapshot, LanguageService, ParsedCommandLine, ScriptSnapshot, sys} from "typescript";
import {DECLARATION_EXTENSION, SOURCE_MAP_EXTENSION} from "./constants";
import {ensureRelative, stripExtension} from "./helpers";
import {ITypescriptLanguageServiceEmitResult, TypescriptLanguageServiceEmitResultKind} from "./i-typescript-language-service-emit-result";
import {ITypescriptLanguageServiceFile, ITypescriptLanguageServiceFileBase} from "./i-typescript-language-service-file";
import {ITypescriptLanguageServiceHost} from "./i-typescript-language-service-host";

/**
 * A LanguageServiceHost for Typescript
 */
export class TypescriptLanguageServiceHost implements ITypescriptLanguageServiceHost {
	/**
	 * The part of a path that matches external modules
	 * @type {string}
	 */
	private static readonly EXTERNAL_MODULES_PATH = "node_modules/";

	/**
	 * The Typescript diagnostic code for files that doesn't exist
	 * @type {number}
	 */
	private readonly NOT_FOUND_DIAGNOSTIC_CODE: number = 6053;
	/**
	 * The LanguageService host to use. Will be equal to this instance
	 * @type {LanguageService}
	 */
	public readonly host: LanguageService;
	/**
	 * A Map between file names and their ITypescriptLanguageServiceFiles
	 * @type {Map<string, ITypescriptLanguageServiceFile>}
	 */
	private readonly files: Map<string, ITypescriptLanguageServiceFile> = new Map();

	/**
	 * A cache map between file names referencing package.json files and their resolved Buffers
	 * @type {Map<string, string>}
	 */
	private readonly moduleCache: Map<string, string> = new Map();

	/**
	 * A cache map between file names referencing package.json files and their resolved Buffers
	 * @type {Map<string, boolean>}
	 */
	private readonly moduleExistsCache: Map<string, boolean> = new Map();

	constructor (private readonly appRoot: string,
							 private readonly parseExternalModules: boolean,
							 private readonly tsFileToRawFileMap: Map<string, string>,
							 private typescriptOptions: ParsedCommandLine) {
		this.host = createLanguageService(this, createDocumentRegistry());

		// Add all of the fileNames from the options. These may not come from Rollup since Rollup won't
		// necessarily pass all matched files through the plugin (if the files contain only types)
		this.typescriptOptions.fileNames.forEach(fileName => {
			const relative = ensureRelative(this.appRoot, fileName);
			if (!this.files.has(relative) && this.fileExists(fileName)) {
				this.addFile({fileName: relative, text: this.readFile(fileName)!, isMainEntry: false});
			}
		});
	}

	/**
	 * Gets the CompilerOptions
	 * @returns {CompilerOptions}
	 */
	public getCompilationSettings (): CompilerOptions {
		return this.typescriptOptions.options;
	}

	/**
	 * Sets the ParsedCommandLine to use
	 * @param {ParsedCommandLine} options
	 */
	public setTypescriptOptions (options: ParsedCommandLine): void {
		this.typescriptOptions = options;
	}

	/**
	 * Gets the used ParsedCommandLine
	 * @returns {ParsedCommandLine}
	 */
	public getTypescriptOptions (): ParsedCommandLine {
		return this.typescriptOptions;
	}

	/**
	 * Adds a file to the LanguageServiceHost
	 * @param {ITypescriptLanguageServiceFileBase} file
	 */
	public addFile (file: ITypescriptLanguageServiceFileBase): void {

		const normalizedFilename = this.normalizeFilename(file.fileName);
		const existing = this.files.get(normalizedFilename);

		this.files.set(normalizedFilename, {
			fileName: normalizedFilename,
			text: file.text,
			isMainEntry: file.isMainEntry,
			file: ScriptSnapshot.fromString(file.text),
			version: existing != null ? `${parseInt(existing.version) + 1}` : "1"
		});
	}

	/**
	 * Removes a file from the LanguageServiceHost
	 * @param {string} fileName
	 */
	public removeFile (fileName: string): void {
		const normalizedFilename = this.normalizeFilename(fileName);
		this.files.delete(normalizedFilename);
	}

	/**
	 * Gets the Script file names
	 * @returns {string[]}
	 */
	public getScriptFileNames (): string[] {
		return Array.from(this.files.keys());
	}

	/**
	 * Gets the Script version for the given file name
	 * @param {string} fileName
	 * @returns {string}
	 */
	public getScriptVersion (fileName: string): string {
		const normalizedFilename = this.normalizeFilename(fileName);
		const file = this.files.get(normalizedFilename);

		return file == null ? "0" : file.version;
	}

	/**
	 * Gets a Script Snapshot for the given file name
	 * @param {string} fileName
	 * @returns {object}
	 */
	public getScriptSnapshot (fileName: string): IScriptSnapshot | undefined {
		const normalizedFilename = this.normalizeFilename(fileName);

		if (this.files.has(normalizedFilename)) {
			return this.files.get(normalizedFilename)!.file;
		}

		// Otherwise, compute the absolute path for the file name
		const absolute = this.makeAbsolute(normalizedFilename);
		const fullPath = existsSync(absolute) ? absolute : undefined;

		if (this.pathIsQualified(fileName) && fullPath != null) {
			this.addFile({fileName: normalizedFilename, text: this.readFile(fullPath)!, isMainEntry: false});
			return this.files.get(normalizedFilename)!.file;
		}

		return ScriptSnapshot.fromString("");
	}

	/**
	 * Gets the text of all files
	 * @returns {string[]}
	 */
	public getAllText (): string[] {
		return Array.from(this.files.values()).map(file => file.text);
	}

	/**
	 * Gets the current directory
	 * @returns {string}
	 */
	public getCurrentDirectory (): string {
		return ".";
	}

	/**
	 * Gets Diagnostics for all files
	 * @returns {Diagnostic[]}
	 */
	public getAllDiagnostics (): ReadonlyArray<Diagnostic> {
		const program = createProgram(this.getScriptFileNames(), this.getTypescriptOptions().options);
		const preEmitDiagnostics = getPreEmitDiagnostics(program);
		return preEmitDiagnostics.filter(diagnostic => {
			// Include all diagnostics that isn't related to files that doesn't exist
			if (diagnostic.code !== this.NOT_FOUND_DIAGNOSTIC_CODE) return true;

			// If any of the mapped files is included in the message text, ignore the diagnostic
			return ![...this.tsFileToRawFileMap.keys()].some(rawFile => typeof diagnostic.messageText === "string" && diagnostic.messageText.includes(rawFile));
		});
	}

	/**
	 * Gets the default lib file name
	 * @returns {string}
	 */
	public getDefaultLibFileName () {
		return getDefaultLibFilePath(this.typescriptOptions.options);
	}

	/**
	 * Whether or not to use case sensitive file names
	 * @returns {boolean}
	 */
	public useCaseSensitiveFileNames (): boolean {
		return sys.useCaseSensitiveFileNames;
	}

	/**
	 * Reads the given directory
	 * @param {string} path
	 * @param {string[]} extensions
	 * @param {string[]} exclude
	 * @param {string[]} include
	 * @param {number?} depth
	 * @returns {string[]}
	 */
	public readDirectory (path: string, extensions?: string[], exclude?: string[], include?: string[], depth?: number): string[] {
		return sys.readDirectory(path, extensions, exclude, include, depth);
	}

	/**
	 * Reads the given file
	 * @param {string} path
	 * @param {string} encoding
	 * @returns {string | undefined}
	 */
	public readFile (path: string, encoding?: string): string | undefined {
		// Use the original path to the file if it has been converted into a ts file
		const normalizedPath = this.tsFileToRawFileMap.has(path) ? this.tsFileToRawFileMap.get(path)! : path;

		const isModule = normalizedPath.includes(TypescriptLanguageServiceHost.EXTERNAL_MODULES_PATH);
		const cacheIdentifier = this.getModuleCacheIdentifier(normalizedPath, encoding);

		// If it is a module file, check if it has been resolved previously and it exists within the cache
		if (isModule) {
			const cachedVersion = this.moduleCache.get(cacheIdentifier);
			if (cachedVersion != null) return cachedVersion;
		}

		// Otherwise, read the file
		const fileResult = sys.readFile(normalizedPath, encoding);

		// Write it to the cache if it is a package.json file
		if (isModule) {
			this.moduleCache.set(cacheIdentifier, fileResult!);
		}
		return fileResult;
	}

	/**
	 * Whether or not the given file exists
	 * @param {string} path
	 * @returns {boolean}
	 */
	public fileExists (path: string): boolean {
		if (this.tsFileToRawFileMap.has(path)) return true;
		if (this.tsFileToRawFileMap.has(`${stripExtension(path).replace(TypescriptLanguageServiceHost.EXTERNAL_MODULES_PATH, "")}.ts`)) return true;

		// Use the original path to the file if it has been converted into a ts file
		const normalizedPath = this.tsFileToRawFileMap.has(path) ? this.tsFileToRawFileMap.get(path)! : path;

		const isModule = normalizedPath.includes(TypescriptLanguageServiceHost.EXTERNAL_MODULES_PATH);
		const cacheIdentifier = this.getModuleCacheIdentifier(normalizedPath);

		// If it is a module file, check if it has been resolved previously and it exists within the cache
		if (isModule) {
			const cachedVersion = this.moduleExistsCache.get(cacheIdentifier);
			if (cachedVersion != null) return cachedVersion;
		}

		// Otherwise, read the file
		const existsResult = sys.fileExists(normalizedPath);

		// Write it to the cache if it is a package.json file
		if (isModule) {
			this.moduleExistsCache.set(cacheIdentifier, existsResult);
		}
		return existsResult;
	}

	/**
	 * Gets the type roots version
	 * @returns {number}
	 */
	public getTypeRootsVersion (): number {
		return 0;
	}

	/**
	 * Whether or not the given directory exists
	 * @param {string} directoryName
	 * @returns {boolean}
	 */
	public directoryExists (directoryName: string): boolean {
		return sys.directoryExists(directoryName);
	}

	/**
	 * Gets the given directories
	 * @param {string} directoryName
	 * @returns {string[]}
	 */
	public getDirectories (directoryName: string): string[] {
		return sys.getDirectories(directoryName);
	}

	/**
	 * Emits the given fileName
	 * @param {string} fileName
	 * @param {boolean} onlyDeclarations
	 * @returns {ITypescriptLanguageServiceEmitResult[]}
	 */
	public emit (fileName: string, onlyDeclarations: boolean = false): ITypescriptLanguageServiceEmitResult[] {
		const normalizedFilename = this.normalizeFilename(fileName);
		return this.host.getEmitOutput(normalizedFilename, onlyDeclarations).outputFiles.map(({name, text}) => ({
			kind: name.endsWith(SOURCE_MAP_EXTENSION)
				? TypescriptLanguageServiceEmitResultKind.MAP
				: name.endsWith(DECLARATION_EXTENSION)
					? TypescriptLanguageServiceEmitResultKind.DECLARATION
					: TypescriptLanguageServiceEmitResultKind.SOURCE,
			fileName: name,
			text,
			isMainEntry: this.files.get(normalizedFilename)!.isMainEntry
		}));
	}

	/**
	 * Gets the identifier to use within the module cache
	 * @param {string} path
	 * @param {string} [encoding]
	 */
	private getModuleCacheIdentifier (path: string, encoding?: string): string {
		return `${path}${encoding == null ? "" : `.${encoding}`}`;
	}

	/**
	 * Returns true if the given path is qualified
	 * @param {string} path
	 * @returns {boolean}
	 */
	private pathIsQualified (path: string): boolean {
		return this.parseExternalModules ? true : !path.includes(TypescriptLanguageServiceHost.EXTERNAL_MODULES_PATH);
	}

	/**
	 * Normalizes the given file name
	 * @param {string} fileName
	 * @returns {string}
	 */
	private normalizeFilename (fileName: string): string {
		return isAbsolute(fileName) ? ensureRelative(this.appRoot, fileName) : fileName;
	}

	/**
	 * Ensure that the given file name is in fact absolute
	 * @param {string} fileName
	 * @returns {string}
	 */
	private makeAbsolute (fileName: string): string {
		return isAbsolute(fileName) ? fileName : join(this.appRoot, fileName);
	}
}