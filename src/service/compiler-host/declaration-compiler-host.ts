import {CompilerHost, CompilerOptions, SourceFile, sys} from "typescript";
import {ICompilerHostOptions} from "./i-compiler-host-options";
import {IDeclarationValue} from "./i-declaration-value";
import {DECLARATION_MAP_EXTENSION} from "../../constant/constant";

/**
 * The CompilerHost to use when generating declaration files
 */
export class DeclarationCompilerHost implements CompilerHost {
	/**
	 * The last written file
	 * @type {IDeclarationValue}
	 */
	public lastValue: IDeclarationValue = {code: "", map: undefined};

	constructor (private readonly options: ICompilerHostOptions) {
	}

	/**
	 * Invoked when a file will be written. This is used to bind to the 'lastValue' property
	 * @param file
	 * @param data
	 */
	public writeFile (file: string, data: string): void {

		// If it is a declaration map, bind to the map output
		if (file.endsWith(DECLARATION_MAP_EXTENSION)) {
			this.lastValue.map = data;
		}

		// Otherwise, bind to the declaration output
		else {
			this.lastValue.code = data;
		}
	}

	/**
	 * Gets the canonical filename for the given file
	 * @param {string} fileName
	 * @returns {string}
	 */
	public getCanonicalFileName (fileName: string): string {
		return this.options.languageServiceHost.getCanonicalFileName(fileName);
	}

	/**
	 * Gets the current directory
	 * @returns {string}
	 */
	public getCurrentDirectory (): string {
		return this.options.languageServiceHost.getCurrentDirectory();
	}

	/**
	 * Gets the default lib file name based on the given CompilerOptions
	 * @param {CompilerOptions} options
	 * @returns {string}
	 */
	public getDefaultLibFileName (options: CompilerOptions): string {
		return this.options.languageServiceHost.getDefaultLibFileName(options);
	}

	/**
	 * Gets the newline to use
	 * @returns {string}
	 */
	public getNewLine (): string {
		return this.options.languageServiceHost.getNewLine();
	}

	/**
	 * Gets the SourceFile to use from the LanguageService
	 * @param {string} fileName
	 * @returns {SourceFile | undefined}
	 */
	public getSourceFile (fileName: string): SourceFile|undefined {
		return this.options.languageService.getProgram()!.getSourceFile(fileName);
	}

	/**
	 * Returns true if file names should be treated as case-sensitive
	 * @returns {boolean}
	 */
	public useCaseSensitiveFileNames (): boolean {
		return this.options.languageServiceHost.useCaseSensitiveFileNames();
	}

	/**
	 * Gets all directories from the given path
	 * @param {string} path
	 * @returns {string[]}
	 */
	public getDirectories (path: string): string[] {
		return sys.getDirectories(path);
	}

	/**
	 * Returns true if the given file exists
	 * @param {string} fileName
	 * @returns {boolean}
	 */
	public fileExists (fileName: string): boolean {
		return this.options.moduleResolutionHost.fileExists(fileName);
	}

	/**
	 * Reads the given file
	 * @param {string} fileName
	 * @returns {string | undefined}
	 */
	public readFile (fileName: string): string|undefined {
		return this.options.moduleResolutionHost.readFile(fileName);
	}
}