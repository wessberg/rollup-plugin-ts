import {existsSync} from "fs";
import {isAbsolute, join} from "path";
import {CompilerOptions, createDocumentRegistry, createLanguageService, createProgram, Diagnostic, getDefaultLibFilePath, getPreEmitDiagnostics, IScriptSnapshot, LanguageService, ParsedCommandLine, ScriptSnapshot, sys} from "typescript";
import {DECLARATION_EXTENSION, SOURCE_MAP_EXTENSION} from "./constants";
import {ensureRelative} from "./helpers";
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
	 * The LanguageService host to use. Will be equal to this instance
	 * @type {LanguageService}
	 */
	public readonly host: LanguageService;
	/**
	 * A Map between file names and their ITypescriptLanguageServiceFiles
	 * @type {Map<string, ITypescriptLanguageServiceFile>}
	 */
	private readonly files: Map<string, ITypescriptLanguageServiceFile> = new Map();

	constructor (private readonly appRoot: string,
							 private readonly parseExternalModules: boolean,
							 private typescriptOptions: ParsedCommandLine) {
		this.host = createLanguageService(this, createDocumentRegistry());

		// Add all of the fileNames from the options. These may not come from Rollup since Rollup won't
		// necessarily pass all matched files through the plugin (if the files contain only types)
		this.typescriptOptions.fileNames.forEach(fileName => {
			const relative = ensureRelative(this.appRoot, fileName);
			if (!this.files.has(relative) && sys.fileExists(fileName)) {
				this.addFile({fileName: relative, text: sys.readFile(fileName)!, isMainEntry: false});
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
			this.addFile({fileName: normalizedFilename, text: sys.readFile(fullPath)!, isMainEntry: false});
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
		return getPreEmitDiagnostics(program);
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
	 * @returns {string[]}
	 */
	public readDirectory (path: string, extensions?: string[], exclude?: string[], include?: string[]): string[] {
		return sys.readDirectory(path, extensions, exclude, include);
	}

	/**
	 * Reads the given file
	 * @param {string} path
	 * @param {string} encoding
	 * @returns {string | undefined}
	 */
	public readFile (path: string, encoding?: string): string | undefined {
		return sys.readFile(path, encoding);
	}

	/**
	 * Whether or not the given file exists
	 * @param {string} path
	 * @returns {boolean}
	 */
	public fileExists (path: string): boolean {
		return sys.fileExists(path);
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