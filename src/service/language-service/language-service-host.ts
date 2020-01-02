import {getNewLineCharacter} from "../../util/get-new-line-character/get-new-line-character";
import {LanguageServiceHostOptions} from "./language-service-host-options";
import {IFile, IFileInput} from "./i-file";
import {getScriptKindFromPath} from "../../util/get-script-kind-from-path/get-script-kind-from-path";
import {dirname, ensureAbsolute, isInternalFile, isTypeScriptLib, join, nativeNormalize, normalize} from "../../util/path/path-util";
import {CustomTransformersFunction} from "../../util/merge-transformers/i-custom-transformer-options";
import {IExtendedDiagnostic} from "../../diagnostic/i-extended-diagnostic";
import {resolveId} from "../../util/resolve-id/resolve-id";
import {TS} from "../../type/ts";
import {ensureModuleTransformer} from "../transformer/ensure-module/ensure-module-transformer";
import {generateSourceFile} from "../../util/generate-source-file/generate-source-file";
import {SupportedExtensions} from "../../util/get-supported-extensions/get-supported-extensions";

// tslint:disable:no-any

/**
 * An implementation of a LanguageService for Typescript
 */
export class LanguageServiceHost implements TS.LanguageServiceHost, TS.CompilerHost {
	private currentProgram: TS.Program | undefined;
	/**
	 * The Set of all files that has been added manually via the public API
	 */
	publicFiles: Set<string> = new Set();

	/**
	 * A Map between file names and their IFiles
	 */
	readonly files: Map<string, IFile> = new Map();

	private readonly printer: TS.Printer;

	/**
	 * The CustomTransformersFunction to use, if any
	 */
	private readonly transformers: CustomTransformersFunction | undefined;

	constructor(private readonly options: LanguageServiceHostOptions) {
		this.addDefaultFileNames();
		this.printer = this.options.typescript.createPrinter({newLine: this.options.parsedCommandLine.options.newLine});
	}

	getCwd(): string {
		return this.options.cwd;
	}

	getSupportedExtensions(): SupportedExtensions {
		return this.options.supportedExtensions;
	}

	getTypescript(): typeof TS {
		return this.options.typescript;
	}

	getTypeRoots() {
		return new Set(this.options.typescript.getEffectiveTypeRoots(this.getCompilationSettings(), this));
	}

	get program(): TS.Program | undefined {
		if (this.currentProgram == null) {
			this.currentProgram = this.options.languageService().getProgram();
			return this.currentProgram;
		}

		return this.currentProgram;
	}

	/**
	 * Writes a file. Will simply put it in the emittedFiles Map
	 */
	writeFile(): void {}

	/**
	 * Gets a SourceFile from the given fileName
	 */
	getSourceFile(fileName: string): TS.SourceFile | undefined {
		const program = this.program;
		if (program == null) return undefined;
		return program.getSourceFile(fileName);
	}

	/**
	 * Gets all SourceFiles
	 */
	getSourceFiles(): readonly TS.SourceFile[] {
		const program = this.program;
		if (program == null) return [];
		return program.getSourceFiles();
	}

	/**
	 * Gets all diagnostics reported of transformers for the given filename
	 */
	getTransformerDiagnostics(fileName?: string): ReadonlyArray<IExtendedDiagnostic> {
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
	 * Adds as file, but ensures that it is a module before adding it
	 */
	addFileAsModule(file: IFileInput, internal: boolean = false): void {
		const sourceFile = generateSourceFile({...this.options, ...file, compilerOptions: this.getCompilationSettings()});
		const code = ensureModuleTransformer({sourceFile, printer: this.printer, typescript: this.options.typescript});
		this.addFile({...file, code}, internal);
	}

	/**
	 * Adds a File to the CompilerHost
	 */
	addFile(file: IFileInput, internal: boolean = false): void {
		const existing = this.files.get(file.file);

		// Don't proceed if the file contents are completely unchanged
		if (existing != null && existing.code === file.code) return;

		this.files.set(file.file, {
			...file,
			scriptKind: getScriptKindFromPath(file.file, this.options.typescript),
			snapshot: this.options.typescript.ScriptSnapshot.fromString(file.code),
			version: existing != null ? existing.version + 1 : 0,
			transformerDiagnostics: []
		});

		if (!internal) {
			// Add the file to the Set of files that has been added manually by the user
			this.publicFiles.add(file.file);
		}

		// Remove the file from the emit cache
		this.currentProgram = undefined;
	}

	/**
	 * Deletes a file from the LanguageService
	 */
	deleteFile(fileName: string): boolean {
		const filesResult = this.files.delete(fileName);
		const publicFilesResult = this.publicFiles.delete(fileName);
		const success = filesResult || publicFilesResult;
		if (success) {
			this.currentProgram = undefined;
		}
		return success;
	}

	/**
	 * Returns true if the given file exists
	 */
	fileExists(fileName: string): boolean {
		// Check if the file exists cached
		if (this.files.has(fileName)) return true;

		// Otherwise, check if it exists on disk
		return this.options.fileSystem.fileExists(nativeNormalize(fileName));
	}

	/**
	 * Gets the current directory
	 */
	getCurrentDirectory(): string {
		return normalize(this.options.cwd);
	}

	/**
	 * Reads the given file
	 */
	readFile(fileName: string, encoding?: string): string | undefined {
		// Check if the file exists within the cached files and return it if so
		const result = this.files.get(fileName);
		if (result != null) return result.code;

		// Otherwise, try to properly resolve the file
		return this.options.fileSystem.readFile(nativeNormalize(fileName), encoding);
	}

	resolveModuleNames(moduleNames: string[], containingFile: string): (TS.ResolvedModuleFull | undefined)[] {
		const resolvedModules: (TS.ResolvedModuleFull | undefined)[] = [];
		for (const moduleName of moduleNames) {
			// try to use standard resolution
			let result = resolveId({
				parent: containingFile,
				id: moduleName,
				moduleResolutionHost: this,
				resolveCache: this.options.resolveCache
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
	 */
	readDirectory(
		path: string,
		extensions?: ReadonlyArray<string>,
		exclude?: ReadonlyArray<string>,
		include?: ReadonlyArray<string>,
		depth?: number
	): string[] {
		return this.options.fileSystem.readDirectory(nativeNormalize(path), extensions, exclude, include, depth).map(normalize);
	}

	/**
	 * Gets the real path for the given path. Meant to resolve symlinks
	 */
	realpath(path: string): string {
		return normalize(this.options.fileSystem.realpath(nativeNormalize(path)));
	}

	getDefaultLibLocation(): string {
		return dirname(this.options.typescript.getDefaultLibFilePath(this.getCompilationSettings()));
	}

	/**
	 * Gets the default lib file name based on the given CompilerOptions
	 */
	getDefaultLibFileName(options: TS.CompilerOptions): string {
		return this.options.typescript.getDefaultLibFileName(options);
	}

	/**
	 * Gets the newline to use
	 */
	getNewLine(): string {
		return this.options.parsedCommandLine.options.newLine != null
			? getNewLineCharacter(this.options.parsedCommandLine.options.newLine, this.options.typescript)
			: this.options.fileSystem.newLine;
	}

	/**
	 * Returns true if file names should be treated as case-sensitive
	 */
	useCaseSensitiveFileNames(): boolean {
		return this.options.fileSystem.useCaseSensitiveFileNames;
	}

	/**
	 * Gets the CompilerOptions provided in the constructor
	 */
	getCompilationSettings(): TS.CompilerOptions {
		return this.options.parsedCommandLine.options;
	}

	/**
	 * Gets the Custom Transformers to use, depending on the current emit mode
	 */
	getCustomTransformers(): TS.CustomTransformers | undefined {
		const languageService = this.options.languageService();
		if (this.transformers == null) return undefined;
		return this.transformers({
			languageService,
			languageServiceHost: this,
			program: this.program,

			/**
			 * This hook can add diagnostics from within CustomTransformers. These will be emitted alongside Typescript diagnostics seamlessly
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
	 */
	getScriptFileNames(): string[] {
		return [...this.files.keys()];
	}

	/**
	 * Gets the ScriptKind for the given file name
	 */
	getScriptKind(fileName: string): TS.ScriptKind {
		return this.assertHasFileName(fileName).scriptKind;
	}

	/**
	 * Gets a ScriptSnapshot for the given file
	 */
	getScriptSnapshot(fileName: string): TS.IScriptSnapshot | undefined {
		const file = this.assertHasFileName(fileName);
		return file.snapshot;
	}

	/**
	 * Gets the Script version for the given file name
	 */
	getScriptVersion(fileName: string): string {
		return String(this.assertHasFileName(fileName).version);
	}

	/**
	 * Gets the canonical filename for the given file
	 */
	getCanonicalFileName(fileName: string): string {
		return this.useCaseSensitiveFileNames() ? fileName : fileName.toLowerCase();
	}

	/**
	 * Gets all directories within the given directory path
	 */
	getDirectories(directoryName: string): string[] {
		return this.options.fileSystem.getDirectories(nativeNormalize(directoryName)).map(normalize);
	}

	/**
	 * Returns true if the given directory exists
	 */
	directoryExists(directoryName: string): boolean {
		return this.options.fileSystem.directoryExists(nativeNormalize(directoryName));
	}

	/**
	 * Adds all default declaration files to the LanguageService
	 */
	private addDefaultFileNames(): void {
		this.options.parsedCommandLine.fileNames.forEach(file => {
			if (!this.options.filter(normalize(ensureAbsolute(this.options.cwd, file)))) return;

			const code = this.options.fileSystem.readFile(nativeNormalize(ensureAbsolute(this.options.cwd, file)));
			if (code != null) {
				this.addFile(
					{
						file,
						code
					},
					true
				);
			}
		});
	}

	private assertHasLib(libName: string): IFile {
		// If the file exists on disk, add it
		const absolutePath = join(this.getDefaultLibLocation(), libName);
		const code = this.options.fileSystem.readFile(nativeNormalize(absolutePath));
		if (code != null) {
			this.addFile({file: libName, code}, true);
			this.addFile({file: absolutePath, code}, true);
			return this.files.get(absolutePath)!;
		} else {
			throw new ReferenceError(`Could not resolve built-in lib: '${libName}'`);
		}
	}

	/**
	 * Asserts that the given file name exists within the LanguageServiceHost
	 */
	private assertHasFileName(fileName: string): IFile {
		if (!this.files.has(fileName)) {
			if (isTypeScriptLib(fileName)) {
				return this.assertHasLib(fileName);
			}
			const absoluteFileName = ensureAbsolute(this.options.cwd, fileName);

			// If the file exists on disk, add it
			const code = this.options.fileSystem.readFile(nativeNormalize(absoluteFileName));
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
