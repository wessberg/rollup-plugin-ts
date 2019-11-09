import {
	CompilerHost,
	CompilerOptions,
	CustomTransformers,
	getDefaultLibFileName,
	IScriptSnapshot,
	LanguageServiceHost,
	ResolvedModuleFull,
	ScriptKind,
	ScriptSnapshot,
	SourceFile
} from "typescript";
import {join} from "path";
import {getNewLineCharacter} from "../../util/get-new-line-character/get-new-line-character";
import {ILanguageServiceOptions} from "./i-language-service-options";
import {IFile, IFileInput} from "./i-file";
import {getScriptKindFromPath} from "../../util/get-script-kind-from-path/get-script-kind-from-path";
import {sync} from "find-up";
import {DEFAULT_LIB_NAMES} from "../../constant/constant";
import {ensureAbsolute, isInternalFile} from "../../util/path/path-util";
import {CustomTransformersFunction} from "../../util/merge-transformers/i-custom-transformer-options";
import {IExtendedDiagnostic} from "../../diagnostic/i-extended-diagnostic";
import {resolveId} from "../../util/resolve-id/resolve-id";

// tslint:disable:no-any

/**
 * An implementation of a LanguageService for Typescript
 */
export class IncrementalLanguageService implements LanguageServiceHost, CompilerHost {
	/**
	 * A Map between filenames and emitted code
	 * @type {Map<string, string>}
	 */
	public emittedFiles: Map<string, string> = new Map();

	/**
	 * The Set of all files that has been added manually via the public API
	 * @type {Set<string>}
	 */
	public publicFiles: Set<string> = new Set();

	/**
	 * The nearest Typescript Lib directory from the given cwd
	 * @type {string | null}
	 */

	private readonly LIB_DIRECTORY = sync("node_modules/typescript/lib", {cwd: this.options.resolveTypescriptLibFrom, type: "directory"});

	/**
	 * The lookup location for the tslib file
	 * @type {string}
	 */

	/**
	 * A Map between file names and their IFiles
	 * @type {Map<string, IFile>}
	 */
	private readonly files: Map<string, IFile> = new Map();
	/**
	 * The CustomTransformersFunction to use, if any
	 * @type {CustomTransformersFunction}
	 */
	private readonly transformers: CustomTransformersFunction | undefined;

	constructor(private readonly options: ILanguageServiceOptions) {
		this.addDefaultLibs();
		this.addDefaultFileNames();
		this.transformers = options.transformers;
	}

	/**
	 * Writes a file. Will simply put it in the emittedFiles Map
	 * @param {string} fileName
	 * @param {string} data
	 */
	public writeFile(fileName: string, data: string): void {
		this.emittedFiles.set(fileName, data);
	}

	/**
	 * Gets a SourceFile from the given fileName
	 * @param {string} fileName
	 * @returns {SourceFile | undefined}
	 */
	public getSourceFile(fileName: string): SourceFile | undefined {
		const program = this.options.languageService().getProgram();
		if (program == null) return undefined;
		return program.getSourceFile(fileName);
	}

	/**
	 * Gets all diagnostics reported of transformers for the given filename
	 * @param {string} fileName
	 * @returns {ReadonlyArray<IExtendedDiagnostic>}
	 */
	public getTransformerDiagnostics(fileName?: string): ReadonlyArray<IExtendedDiagnostic> {
		// If diagnostics for only a specific file should be retrieved, try to get it from the files map and return its transformer diagnostics
		if (fileName != null) {
			const fileMatch = this.files.get(fileName);
			if (fileMatch == null) return [];
			return fileMatch.transformerDiagnostics;
		}

		// Otherwise, take all transformer diagnostics for all files
		else {
			return ([] as IExtendedDiagnostic[]).concat.apply(
				[],
				[...this.files.values()].map(v => v.transformerDiagnostics)
			);
		}
	}

	/**
	 * Adds a File to the CompilerHost
	 * @param {IFile} file
	 * @param {boolean} internal
	 */
	public addFile(file: IFileInput, internal: boolean = false): void {
		const existing = this.files.get(file.file);

		// Don't proceed if the file contents are completely unchanged
		if (existing != null && existing.code === file.code) return;

		this.files.set(file.file, {
			...file,
			scriptKind: getScriptKindFromPath(file.file),
			snapshot: ScriptSnapshot.fromString(file.code),
			version: existing != null ? existing.version + 1 : 0,
			transformerDiagnostics: []
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
	public deleteFile(fileName: string): boolean {
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
	public fileExists(fileName: string): boolean {
		// Check if the file exists cached
		if (this.files.has(fileName)) return true;

		// Otherwise, check if it exists on disk
		return this.options.fileSystem.fileExists(fileName);
	}

	/**
	 * Gets the current directory
	 * @returns {string}
	 */
	public getCurrentDirectory(): string {
		return this.options.cwd;
	}

	/**
	 * Reads the given file
	 * @param {string} fileName
	 * @param {string} [encoding]
	 * @returns {string | undefined}
	 */
	public readFile(fileName: string, encoding?: string): string | undefined {
		// Check if the file exists within the cached files and return it if so
		const result = this.files.get(fileName);
		if (result != null) return result.code;

		// Otherwise, try to properly resolve the file
		return this.options.fileSystem.readFile(fileName, encoding);
	}

	public resolveModuleNames(moduleNames: string[], containingFile: string): (ResolvedModuleFull | undefined)[] {
		const resolvedModules: (ResolvedModuleFull | undefined)[] = [];
		for (const moduleName of moduleNames) {
			// try to use standard resolution
			let result = resolveId({
				cwd: this.options.cwd,
				parent: containingFile,
				id: moduleName,
				moduleResolutionHost: this,
				options: this.getCompilationSettings(),
				resolveCache: this.options.resolveCache,
				supportedExtensions: this.options.supportedExtensions
			});
			if (result != null && result.resolvedAmbientFileName != null) {
				resolvedModules.push({...result, resolvedFileName: result.resolvedAmbientFileName});
			} else if (result != null && result.resolvedFileName != null) {
				resolvedModules.push({...result, resolvedFileName: result.resolvedFileName});
			} else {
				resolvedModules.push(undefined);
			}
		}
		return resolvedModules;
	}

	/**
	 * Reads the given directory
	 * @param {string} path
	 * @param {ReadonlyArray<string>} extensions
	 * @param {ReadonlyArray<string>} exclude
	 * @param {ReadonlyArray<string>} include
	 * @param {number} depth
	 * @returns {string[]}
	 */
	public readDirectory(
		path: string,
		extensions?: ReadonlyArray<string>,
		exclude?: ReadonlyArray<string>,
		include?: ReadonlyArray<string>,
		depth?: number
	): string[] {
		return this.options.fileSystem.readDirectory(path, extensions, exclude, include, depth);
	}

	/**
	 * Gets the real path for the given path. Meant to resolve symlinks
	 * @param {string} path
	 * @returns {string}
	 */
	public realpath(path: string): string {
		return this.options.fileSystem.realpath(path);
	}

	/**
	 * Gets the default lib file name based on the given CompilerOptions
	 * @param {CompilerOptions} options
	 * @returns {string}
	 */
	public getDefaultLibFileName(options: CompilerOptions): string {
		return getDefaultLibFileName(options);
	}

	/**
	 * Gets the newline to use
	 * @returns {string}
	 */
	public getNewLine(): string {
		return this.options.parsedCommandLine.options.newLine != null
			? getNewLineCharacter(this.options.parsedCommandLine.options.newLine)
			: this.options.fileSystem.newLine;
	}

	/**
	 * Returns true if file names should be treated as case-sensitive
	 * @returns {boolean}
	 */
	public useCaseSensitiveFileNames(): boolean {
		return this.options.fileSystem.useCaseSensitiveFileNames;
	}

	/**
	 * Gets the CompilerOptions provided in the constructor
	 * @returns {CompilerOptions}
	 */
	public getCompilationSettings(): CompilerOptions {
		return this.options.parsedCommandLine.options;
	}

	/**
	 * Gets the Custom Transformers to use, depending on the current emit mode
	 * @returns {CustomTransformers | undefined}
	 */
	public getCustomTransformers(): CustomTransformers | undefined {
		const languageService = this.options.languageService();
		if (this.transformers == null) return undefined;
		return this.transformers({
			languageService,
			languageServiceHost: this,
			program: languageService.getProgram(),

			/**
			 * This hook can add diagnostics from within CustomTransformers. These will be emitted alongside Typescript diagnostics seamlessly
			 * @param {IExtendedDiagnostic} diagnostics
			 */
			addDiagnostics: (...diagnostics) => {
				diagnostics.forEach(diagnostic => {
					// Skip diagnostics that doesn't point to a specific file
					if (diagnostic.file == null) return;
					const fileMatch = this.files.get(diagnostic.file.fileName);
					// If no file matches the one of the diagnostic, skip it
					if (fileMatch == null) return;

					// Add the diagnostic
					fileMatch.transformerDiagnostics.push(diagnostic);
				});
			}
		});
	}

	/**
	 * Gets all Script file names
	 * @returns {string[]}
	 */
	public getScriptFileNames(): string[] {
		return [...this.files.keys()];
	}

	/**
	 * Gets the ScriptKind for the given file name
	 * @param {string} fileName
	 * @returns {ScriptKind}
	 */
	public getScriptKind(fileName: string): ScriptKind {
		return this.assertHasFileName(fileName).scriptKind;
	}

	/**
	 * Gets a ScriptSnapshot for the given file
	 * @param {string} fileName
	 * @returns {IScriptSnapshot | undefined}
	 */
	public getScriptSnapshot(fileName: string): IScriptSnapshot | undefined {
		const file = this.assertHasFileName(fileName);
		return file.snapshot;
	}

	/**
	 * Gets the Script version for the given file name
	 * @param {string} fileName
	 * @returns {string}
	 */
	public getScriptVersion(fileName: string): string {
		return String(this.assertHasFileName(fileName).version);
	}

	/**
	 * Gets the canonical filename for the given file
	 * @param {string} fileName
	 * @returns {string}
	 */
	public getCanonicalFileName(fileName: string): string {
		return this.useCaseSensitiveFileNames() ? fileName : fileName.toLowerCase();
	}

	/**
	 * Gets all directories within the given directory path
	 * @param {string} directoryName
	 * @returns {string[]}
	 */
	public getDirectories(directoryName: string): string[] {
		return this.options.fileSystem.getDirectories(directoryName);
	}

	/**
	 * Returns true if the given directory exists
	 * @param {string} directoryName
	 * @returns {boolean}
	 */
	public directoryExists(directoryName: string): boolean {
		return this.options.fileSystem.directoryExists(directoryName);
	}

	/**
	 * Adds all default lib files to the LanguageService
	 */
	private addDefaultLibs(): void {
		DEFAULT_LIB_NAMES.forEach(libName => {
			if (this.LIB_DIRECTORY == null) return;

			const path = join(this.LIB_DIRECTORY, libName);
			const code = this.options.fileSystem.readFile(path);
			if (code == null) return;

			this.addFile(
				{
					file: libName,
					code
				},
				true
			);
		});
	}

	/**
	 * Adds all default declaration files to the LanguageService
	 */
	private addDefaultFileNames(): void {
		this.options.parsedCommandLine.fileNames.forEach(file => {
			const code = this.options.fileSystem.readFile(ensureAbsolute(this.options.cwd, file));
			if (code != null) {
				this.addFile(
					{
						file: file,
						code
					},
					true
				);
			}
		});
	}

	/**
	 * Asserts that the given file name exists within the LanguageServiceHost
	 * @param {string} fileName
	 * @returns {IFile}
	 */
	private assertHasFileName(fileName: string): IFile {
		if (!this.files.has(fileName)) {
			const absoluteFileName = DEFAULT_LIB_NAMES.has(fileName) ? fileName : ensureAbsolute(this.options.cwd, fileName);

			// If the file exists on disk, add it
			const code = this.options.fileSystem.readFile(absoluteFileName);
			if (code != null) {
				this.addFile({file: absoluteFileName, code}, isInternalFile(absoluteFileName));
				return this.files.get(absoluteFileName)!;
			} else {
				throw new ReferenceError(`The given file: '${absoluteFileName}' doesn't exist!`);
			}
		} else {
			return this.files.get(fileName)!;
		}
	}
}
