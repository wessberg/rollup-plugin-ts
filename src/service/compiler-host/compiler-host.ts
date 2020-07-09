import {TS} from "../../type/ts";
import {CompilerHostOptions, CustomTransformersInput} from "./compiler-host-options";
import {ModuleResolutionHost} from "../module-resolution-host/module-resolution-host";
import {dirname, ensureAbsolute, getExtension, isTypeScriptLib, join, nativeNormalize, normalize} from "../../util/path/path-util";
import {getNewLineCharacter} from "../../util/get-new-line-character/get-new-line-character";
import {resolveId} from "../../util/resolve-id/resolve-id";
import {getScriptKindFromPath} from "../../util/get-script-kind-from-path/get-script-kind-from-path";
import {VirtualFile, VirtualFileInput} from "../module-resolution-host/virtual-file";
import {mergeTransformers} from "../../util/merge-transformers/merge-transformers";
import {ensureModuleTransformer} from "../transformer/ensure-module/ensure-module-transformer";
import {SourceFileToDependenciesMap} from "../transformer/declaration-bundler/declaration-bundler-options";
import {ExtendedResolvedModule} from "../cache/resolve-cache/extended-resolved-module";
import {getModuleDependencies} from "../../util/get-module-dependencies/get-module-dependencies";

export class CompilerHost extends ModuleResolutionHost implements TS.CompilerHost {
	private previousProgram: TS.EmitAndSemanticDiagnosticsBuilderProgram | undefined;
	private currentProgram: TS.EmitAndSemanticDiagnosticsBuilderProgram | undefined;
	private currentTypeRoots: Set<string> | undefined;
	private currentProgramInstance: TS.Program | undefined;
	private currentTypeChecker: TS.TypeChecker | undefined;
	private emitOutput: TS.EmitOutput | undefined;

	constructor(
		protected readonly options: CompilerHostOptions,
		protected readonly printer: TS.Printer = options.typescript.createPrinter({
			newLine: options.parsedCommandLineResult.parsedCommandLine.options.newLine
		}),
		protected readonly sourceFiles: Map<string, TS.SourceFile> = new Map(),
		protected readonly transformerDiagnostics: Map<string, TS.Diagnostic[]> = new Map(),
		protected readonly fileToVersionMap: Map<string, number> = new Map(),
		protected readonly sourceFileToDependenciesMap: SourceFileToDependenciesMap = new Map(),
		files?: Map<string, VirtualFile>
	) {
		super(options, files);
		this.addDefaultFileNames();
	}

	allowTransformingDeclarations(): boolean {
		return this.options.allowTransformingDeclarations === true;
	}

	isSupportedFileName(fileName: string, ignoreFilter = false): boolean {
		return (ignoreFilter || this.options.filter(fileName)) && this.getSupportedExtensions().has(getExtension(fileName));
	}

	getDiagnostics(fileName?: string): readonly TS.Diagnostic[] {
		const program = this.getProgram();

		const sourceFile = fileName == null ? undefined : this.getSourceFile(fileName);

		const baseDiagnostics = [
			...this.getParsedCommandLine().errors,
			...program.getConfigFileParsingDiagnostics(),
			...program.getOptionsDiagnostics(),
			...program.getSyntacticDiagnostics(sourceFile),
			...program.getGlobalDiagnostics(),
			...program.getSemanticDiagnostics(sourceFile)
		];

		if (sourceFile != null) {
			return [...baseDiagnostics, ...(this.transformerDiagnostics.get(sourceFile.fileName) ?? [])];
		} else {
			const extraDiagnostics: TS.Diagnostic[] = [];
			for (const transformerDiagnostics of this.transformerDiagnostics.values()) {
				extraDiagnostics.push(...transformerDiagnostics);
			}

			return [...baseDiagnostics, ...extraDiagnostics];
		}
	}

	emitBuildInfo(): TS.EmitOutput {
		this.popEmitOutput();
		const programWithEmitBuildInfo = this.getProgramInstance() as TS.Program & {emitBuildInfo?(writeFileCallback: TS.WriteFileCallback): void};
		// A non-exposed internal method, emitBuildInfo, is used, if available (which it is from TypeScript v3.4 and up)
		// If not, we would have to emit the entire Program (or pending affected files) which can be avoided for maximum performance
		programWithEmitBuildInfo.emitBuildInfo?.(this.writeFile.bind(this));

		return this.popEmitOutput();
	}

	emit(fileName?: string, onlyDts = false, transformers?: CustomTransformersInput): TS.EmitOutput {
		this.popEmitOutput();

		const sourceFile = fileName == null ? undefined : this.getSourceFile(fileName);
		const customTransformers = this.getCustomTransformers(transformers);
		let hasEmitted = false;

		const runEmit = (program: TS.Program | TS.EmitAndSemanticDiagnosticsBuilderProgram) => {
			program.emit(
				sourceFile,
				(file, data, writeByteOrderMark) => {
					hasEmitted = true;
					this.writeFile(file, data, writeByteOrderMark);
				},
				undefined,
				onlyDts,
				customTransformers
			);
		};

		runEmit(this.getProgram());

		// TypeScript will not emit if a builder-program haven't changed. In that case, use the underlying program instance and emit with that one.
		if (!hasEmitted) {
			runEmit(this.getProgramInstance());
		}

		return this.popEmitOutput();
	}

	writeFile(name: string, text: string, writeByteOrderMark: boolean): void {
		const emitOutput = this.ensureEmitOutput();
		emitOutput.outputFiles.push({
			name,
			text,
			writeByteOrderMark
		});
	}

	getScriptTarget(): TS.ScriptTarget {
		return this.getCompilationSettings().target ?? this.getTypescript().ScriptTarget.ES3;
	}

	private createProgram(): TS.EmitAndSemanticDiagnosticsBuilderProgram {
		const typescript = this.getTypescript();

		// The --incremental option is part of TypeScript 3.4 and up only
		if ("createIncrementalProgram" in (typescript as Partial<typeof TS>)) {
			return typescript.createIncrementalProgram({
				rootNames: [...this.getFileNames()],
				options: this.getCompilationSettings(),
				host: this
			});
		} else {
			return typescript.createEmitAndSemanticDiagnosticsBuilderProgram([...this.getFileNames()], this.getCompilationSettings(), this, this.previousProgram);
		}
	}

	getProgram(): TS.EmitAndSemanticDiagnosticsBuilderProgram {
		if (this.currentProgram == null) {
			this.currentProgram = this.createProgram();
		}
		return this.currentProgram;
	}

	getPrinter(): TS.Printer {
		return this.printer;
	}

	getProgramInstance(): TS.Program {
		if (this.currentProgramInstance == null) {
			this.currentProgramInstance = this.getProgram().getProgram();
		}
		return this.currentProgramInstance;
	}

	getTypeChecker(): TS.TypeChecker {
		if (this.currentTypeChecker == null) {
			this.currentTypeChecker = this.getProgramInstance().getTypeChecker();
		}
		return this.currentTypeChecker;
	}

	getFilter(): (id: string) => boolean {
		return this.options.filter;
	}

	getTransformers(): CustomTransformersInput {
		return this.options.transformers;
	}

	private getDependenciesForFileDeep(fileName: string, dependencies: Set<ExtendedResolvedModule> = new Set(), seenModules: Set<string> = new Set()): Set<ExtendedResolvedModule> {
		if (seenModules.has(fileName)) return dependencies;
		seenModules.add(fileName);
		const localDependencies = this.sourceFileToDependenciesMap.get(fileName);
		const dependenciesArr = [...dependencies];
		if (localDependencies != null) {
			for (const dependency of localDependencies) {
				if (
					!dependenciesArr.some(
						({resolvedFileName, resolvedAmbientFileName}) => resolvedFileName === dependency.resolvedFileName && resolvedAmbientFileName === dependency.resolvedAmbientFileName
					)
				) {
					dependencies.add(dependency);
					if (dependency.resolvedFileName != null) this.getDependenciesForFileDeep(dependency.resolvedFileName, dependencies, seenModules);
					if (dependency.resolvedAmbientFileName != null) {
						this.getDependenciesForFileDeep(dependency.resolvedAmbientFileName, dependencies, seenModules);
					}
				}
			}
		}
		return dependencies;
	}

	getDependenciesForFile(fileName: string, deep = false): Set<ExtendedResolvedModule> | undefined {
		if (deep) {
			return this.getDependenciesForFileDeep(fileName);
		}
		return this.sourceFileToDependenciesMap.get(fileName);
	}

	getAllDependencies(): SourceFileToDependenciesMap {
		return this.sourceFileToDependenciesMap;
	}

	add(fileInput: VirtualFileInput | VirtualFile): VirtualFile {
		const existing = this.get(fileInput.fileName);
		if (existing != null && existing.text === fileInput.text) return existing;

		this.delete(fileInput.fileName);

		if (fileInput.fromRollup) {
			const sourceFile = this.constructSourceFile(fileInput.fileName, fileInput.text);
			const typescript = this.getTypescript();
			const compatFactory = (typescript.factory as TS.NodeFactory | undefined) ?? typescript;
			const transformedSourceFile = ensureModuleTransformer({typescript, compatFactory, sourceFile});
			if (transformedSourceFile !== sourceFile) {
				(fileInput as VirtualFile).transformedText = this.printer.printFile(transformedSourceFile);
			}
		}

		const addedFile = super.add(fileInput);
		this.refreshDependenciesForFileName(fileInput.fileName);
		return addedFile;
	}

	private refreshDependenciesForFileName(fileName: string, seenModules: Set<string> = new Set()): void {
		if (seenModules.has(fileName)) return;
		seenModules.add(fileName);

		const dependencies = getModuleDependencies({
			compilerHost: this,
			module: fileName
		});

		if (dependencies == null) return;
		this.sourceFileToDependenciesMap.set(fileName, dependencies);

		for (const resolveResult of dependencies) {
			for (const module of [resolveResult.resolvedFileName, resolveResult.resolvedAmbientFileName]) {
				if (module == null) continue;
				this.refreshDependenciesForFileName(module, seenModules);
			}
		}
	}

	private constructSourceFile(fileName: string, text: string, languageVersion: TS.ScriptTarget = this.getScriptTarget()): TS.SourceFile {
		return this.getTypescript().createSourceFile(fileName, text, languageVersion, true, getScriptKindFromPath(fileName, this.getTypescript()));
	}

	private clearProgram(): void {
		this.previousProgram = this.currentProgram;
		this.currentProgram = undefined;
		this.currentProgramInstance = undefined;
		this.currentTypeChecker = undefined;
	}

	private ensureEmitOutput(): TS.EmitOutput {
		if (this.emitOutput == null) {
			this.emitOutput = {
				outputFiles: [],
				emitSkipped: false
			};
		}
		return this.emitOutput;
	}

	private popEmitOutput(): TS.EmitOutput {
		const emitOutput = this.ensureEmitOutput();
		this.emitOutput = undefined;
		return emitOutput;
	}

	delete(fileName: string): boolean {
		const superDelete = super.delete(fileName);
		const sourceFilesDelete = this.sourceFiles.delete(fileName);
		const transformerDiagnosticsDelete = this.transformerDiagnostics.delete(fileName);
		const sourceFileToDependenciesMapDelete = this.sourceFileToDependenciesMap.delete(fileName);
		const success = superDelete || sourceFilesDelete || transformerDiagnosticsDelete || sourceFileToDependenciesMapDelete;
		this.clearProgram();
		return success;
	}

	clone(compilerOptions: TS.CompilerOptions, overrides: Partial<Omit<CompilerHostOptions, "parsedCommandLineResult">> = {}): CompilerHost {
		return new CompilerHost(
			{
				...this.options,
				...overrides,
				parsedCommandLineResult: {
					...this.options.parsedCommandLineResult,
					parsedCommandLine: {
						...this.getParsedCommandLine(),
						options: {
							...this.getCompilationSettings(),
							...compilerOptions
						}
					}
				}
			},
			this.printer,
			new Map(this.sourceFiles),
			new Map(this.transformerDiagnostics),
			new Map(this.fileToVersionMap),
			new Map(this.sourceFileToDependenciesMap),
			new Map(this.files)
		);
	}

	getSourceFile(fileName: string, languageVersion: TS.ScriptTarget = this.getScriptTarget()): TS.SourceFile | undefined {
		const absoluteFileName = isTypeScriptLib(fileName) ? join(this.getDefaultLibLocation(), fileName) : ensureAbsolute(this.getCwd(), fileName);

		if (this.sourceFiles.has(absoluteFileName)) {
			return this.sourceFiles.get(absoluteFileName);
		}

		if (!this.isSupportedFileName(absoluteFileName, true)) return undefined;

		let file = this.get(absoluteFileName);

		if (file == null) {
			const text = this.readFile(absoluteFileName);
			if (text == null) return undefined;
			file = this.add({fileName: absoluteFileName, text, fromRollup: false});
		}

		const sourceFile = this.constructSourceFile(absoluteFileName, file.transformedText, languageVersion);
		this.sourceFiles.set(absoluteFileName, sourceFile);

		const oldVersion = this.fileToVersionMap.get(absoluteFileName) ?? 0;
		const newVersion = oldVersion + 1;
		this.fileToVersionMap.set(absoluteFileName, newVersion);

		// SourceFiles in builder programs needs a version
		((sourceFile as unknown) as {version: number}).version = newVersion;

		return sourceFile;
	}

	getTypeRoots() {
		if (this.currentTypeRoots == null) {
			this.currentTypeRoots = new Set(this.getTypescript().getEffectiveTypeRoots(this.getCompilationSettings(), this));
		}
		return this.currentTypeRoots;
	}

	getDefaultLibLocation(): string {
		return dirname(this.getTypescript().getDefaultLibFilePath(this.getCompilationSettings()));
	}

	/**
	 * Gets the Custom Transformers to use, depending on the current emit mode
	 */
	getCustomTransformers(transformers: CustomTransformersInput = this.getTransformers()): TS.CustomTransformers | undefined {
		const mergedTransformers = mergeTransformers(transformers);
		const upgradedTransformers = mergedTransformers({
			program: this.getProgramInstance(),
			typescript: this.getTypescript(),
			printer: this.printer,

			/**
			 * This hook can add diagnostics from within CustomTransformers. These will be emitted alongside Typescript diagnostics seamlessly
			 */
			addDiagnostics: (...diagnostics) => {
				diagnostics.forEach(diagnostic => {
					// Skip diagnostics that doesn't point to a specific file
					if (diagnostic.file == null) return;
					let transformerDiagnostics = this.transformerDiagnostics.get(diagnostic.file.fileName);
					// If no file matches the one of the diagnostic, skip it
					if (transformerDiagnostics == null) {
						transformerDiagnostics = [];
						this.transformerDiagnostics.set(diagnostic.file.fileName, transformerDiagnostics);
					}

					// Add the diagnostic
					transformerDiagnostics.push(diagnostic);
				});
			}
		});

		// Ensure that declarations are never transformed if not allowed
		if (!this.allowTransformingDeclarations()) {
			return {
				...upgradedTransformers,
				afterDeclarations: undefined
			};
		}
		return upgradedTransformers;
	}

	/**
	 * Gets the default lib file name based on the given CompilerOptions
	 */
	getDefaultLibFileName(compilerOptions: TS.CompilerOptions): string {
		return this.getTypescript().getDefaultLibFileName(compilerOptions);
	}

	/**
	 * Gets the canonical filename for the given file
	 */
	getCanonicalFileName(fileName: string): string {
		return this.useCaseSensitiveFileNames() ? fileName : fileName.toLowerCase();
	}

	/**
	 * Returns true if file names should be treated as case-sensitive
	 */
	useCaseSensitiveFileNames(): boolean {
		return this.getFileSystem().useCaseSensitiveFileNames;
	}

	/**
	 * Gets the newline to use
	 */
	getNewLine(): string {
		const compilationSettings = this.getCompilationSettings();
		return compilationSettings.newLine != null ? getNewLineCharacter(compilationSettings.newLine, this.getTypescript()) : this.getFileSystem().newLine;
	}

	/**
	 * Reads the given directory
	 */
	readDirectory(path: string, extensions: readonly string[], exclude: readonly string[] | undefined, include: readonly string[], depth?: number): string[] {
		return this.getFileSystem().readDirectory(nativeNormalize(path), extensions, exclude, include, depth).map(normalize);
	}

	resolve(moduleName: string, containingFile: string): ExtendedResolvedModule | null {
		return resolveId({
			moduleResolutionHost: this,
			parent: containingFile,
			id: moduleName,
			resolveCache: this.options.resolveCache
		});
	}

	resolveModuleNames(moduleNames: string[], containingFile: string): (TS.ResolvedModuleFull | undefined)[] {
		const resolvedModules: (TS.ResolvedModuleFull | undefined)[] = [];
		for (const moduleName of moduleNames) {
			const result = this.resolve(moduleName, containingFile);

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

	resolveTypeReferenceDirectives(typeReferenceDirectiveNames: string[], containingFile: string): (TS.ResolvedTypeReferenceDirective | undefined)[] {
		const resolvedTypeReferenceDirectives: (TS.ResolvedTypeReferenceDirective | undefined)[] = [];
		for (const typeReferenceDirectiveName of typeReferenceDirectiveNames) {
			// try to use standard resolution
			const result = resolveId({
				moduleResolutionHost: this,
				parent: containingFile,
				id: typeReferenceDirectiveName,
				resolveCache: this.options.resolveCache
			});
			if (result != null && result.resolvedAmbientFileName != null) {
				resolvedTypeReferenceDirectives.push({...result, primary: true, resolvedFileName: result.resolvedAmbientFileName});
			} else if (result != null && result.resolvedFileName != null) {
				resolvedTypeReferenceDirectives.push({...result, primary: true, resolvedFileName: result.resolvedFileName});
			} else {
				resolvedTypeReferenceDirectives.push(undefined);
			}
		}
		return resolvedTypeReferenceDirectives;
	}

	/**
	 * Adds all default declaration files to the LanguageService
	 */
	private addDefaultFileNames(): void {
		this.getParsedCommandLine().fileNames.forEach(file => {
			const fileName = ensureAbsolute(this.getCwd(), file);

			if (!this.getFilter()(normalize(fileName))) return;

			const text = this.readFile(fileName);
			if (text != null) {
				this.add({
					fileName,
					text,
					fromRollup: false
				});
			}
		});
	}
}
