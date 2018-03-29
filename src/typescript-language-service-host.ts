import {ITypescriptLanguageServiceEmitResult, TypescriptLanguageServiceEmitResultKind} from "./i-typescript-language-service-emit-result";
import {ITypescriptLanguageServiceFile, ITypescriptLanguageServiceFileBase} from "./i-typescript-language-service-file";
import {LanguageService, ParsedCommandLine, createLanguageService, createDocumentRegistry, CompilerOptions, ScriptSnapshot, IScriptSnapshot, Diagnostic, sys, getDefaultLibFilePath, createProgram, getPreEmitDiagnostics} from "typescript";
import {ITypescriptLanguageServiceHost} from "./i-typescript-language-service-host";
import {DECLARATION_EXTENSION, SOURCE_MAP_EXTENSION} from "./constants";

/**
 * A LanguageServiceHost for Typescript
 */
export class TypescriptLanguageServiceHost implements ITypescriptLanguageServiceHost {
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

	constructor (private typescriptOptions: ParsedCommandLine) {
		this.host = createLanguageService(this, createDocumentRegistry());
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
		const existing = this.files.get(file.fileName);
		const version = existing != null ? `${parseInt(existing.version) + 1}` : "1";
		this.files.set(file.fileName, {...file, file: ScriptSnapshot.fromString(file.text), version});
	}

	/**
	 * Removes a file from the LanguageServiceHost
	 * @param {string} fileName
	 */
	public removeFile (fileName: string): void {
		this.files.delete(fileName);
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
		const file = this.files.get(fileName);

		return file == null ? "0" : file.version;
	}

	/**
	 * Gets the Script text for the given file name
	 * @param {string} fileName
	 * @returns {string}
	 */
	public getScriptText (fileName: string): string {
		const file = this.files.get(fileName);
		return file == null ? "" : file.text;
	}

	/**
	 * Gets a Script Snapshot for the given file name
	 * @param {string} fileName
	 * @returns {object}
	 */
	public getScriptSnapshot (fileName: string): IScriptSnapshot {
		return ScriptSnapshot.fromString(this.getScriptText(fileName));
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
	public readFile (path: string, encoding?: string): string|undefined {
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
		return this.host.getEmitOutput(fileName, onlyDeclarations).outputFiles.map(({name, text}) => ({
			kind: name.endsWith(SOURCE_MAP_EXTENSION)
				? TypescriptLanguageServiceEmitResultKind.MAP
				: name.endsWith(DECLARATION_EXTENSION)
					? TypescriptLanguageServiceEmitResultKind.DECLARATION
					: TypescriptLanguageServiceEmitResultKind.SOURCE,
			fileName: name,
			text
		}));
	}
}