import {TS} from "../../type/ts";
import {CompilerHostOptions} from "./compiler-host-options";
import {ModuleResolutionHost} from "../module-resolution-host/module-resolution-host";
import {dirname, ensureAbsolute, isTypeScriptLib, join, nativeNormalize, normalize} from "../../util/path/path-util";
import {getNewLineCharacter} from "../../util/get-new-line-character/get-new-line-character";
import {resolveId} from "../../util/resolve-id/resolve-id";
import {getScriptKindFromPath} from "../../util/get-script-kind-from-path/get-script-kind-from-path";
import {VirtualFile, VirtualFileInput} from "../module-resolution-host/virtual-file";
import {CustomTransformersFunction} from "../../util/merge-transformers/i-custom-transformer-options";
import {mergeTransformers} from "../../util/merge-transformers/merge-transformers";
import {ensureModuleTransformer} from "../transformer/ensure-module/ensure-module-transformer";

export class CompilerHost extends ModuleResolutionHost implements TS.CompilerHost {
	private previousProgram: TS.EmitAndSemanticDiagnosticsBuilderProgram | undefined;
	private currentProgram: TS.EmitAndSemanticDiagnosticsBuilderProgram | undefined;
	private currentProgramInstance: TS.Program | undefined;
	private currentTypeChecker: TS.TypeChecker | undefined;
	private emitOutput: TS.EmitOutput | undefined;

	constructor(
		protected readonly options: CompilerHostOptions,
		protected readonly printer: TS.Printer = options.typescript.createPrinter({newLine: options.parsedCommandLine.options.newLine}),
		protected readonly sourceFiles: Map<string, TS.SourceFile> = new Map(),
		protected readonly transformerDiagnostics: Map<string, TS.Diagnostic[]> = new Map(),
		protected readonly fileToVersionMap: Map<string, number> = new Map(),
		files?: Map<string, VirtualFile>
	) {
		super(options, files);
		this.addDefaultFileNames();
	}

	getDiagnostics(fileName?: string): readonly TS.Diagnostic[] {
		const program = this.getProgram();

		const sourceFile = fileName == null ? undefined : this.getSourceFile(fileName);
		const baseDiagnostics = [
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

	emit(
		fileName?: string,
		onlyDts: boolean = false,
		...extraTransformers: (CustomTransformersFunction | TS.CustomTransformers | undefined)[]
	): TS.EmitOutput {
		this.popEmitOutput();

		const sourceFile = fileName == null ? undefined : this.getSourceFile(fileName);
		const customTransformers = this.getCustomTransformers(...extraTransformers);
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

	getProgram(): TS.EmitAndSemanticDiagnosticsBuilderProgram {
		if (this.currentProgram == null) {
			this.currentProgram = this.getTypescript().createEmitAndSemanticDiagnosticsBuilderProgram(
				[...this.getFileNames()],
				this.getCompilationSettings(),
				this,
				this.previousProgram
			);
		}
		return this.currentProgram;
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

	getTransformers(): CustomTransformersFunction | undefined {
		return this.options.transformers;
	}

	add(fileInput: VirtualFileInput | VirtualFile): VirtualFile {
		const existing = this.get(fileInput.fileName);
		if (existing != null && existing.text === fileInput.text) return existing;

		this.sourceFiles.delete(fileInput.fileName);
		this.transformerDiagnostics.delete(fileInput.fileName);
		this.clearProgram();

		if (fileInput.fromRollup) {
			const sourceFile = this.constructSourceFile(fileInput.fileName, fileInput.text);
			const transformedSourceFile = ensureModuleTransformer({typescript: this.getTypescript(), sourceFile});
			if (transformedSourceFile !== sourceFile) {
				(fileInput as VirtualFile).transformedText = this.printer.printFile(transformedSourceFile);
			}
		}

		return super.add(fileInput);
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
		const success = super.delete(fileName) || this.sourceFiles.delete(fileName) || this.transformerDiagnostics.delete(fileName);
		this.clearProgram();
		return success;
	}

	clone(compilerOptions: TS.CompilerOptions): CompilerHost {
		return new CompilerHost(
			{
				...this.options,
				parsedCommandLine: {
					...this.getParsedCommandLine(),
					options: {
						...this.getCompilationSettings(),
						...compilerOptions
					}
				}
			},
			this.printer,
			new Map(this.sourceFiles),
			new Map(this.transformerDiagnostics),
			new Map(this.fileToVersionMap),
			new Map(this.files)
		);
	}

	getSourceFile(fileName: string, languageVersion: TS.ScriptTarget = this.getScriptTarget()): TS.SourceFile | undefined {
		const absoluteFileName = isTypeScriptLib(fileName) ? join(this.getDefaultLibLocation(), fileName) : ensureAbsolute(this.getCwd(), fileName);

		if (this.sourceFiles.has(absoluteFileName)) {
			return this.sourceFiles.get(absoluteFileName);
		}

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
		return new Set(this.getTypescript().getEffectiveTypeRoots(this.getCompilationSettings(), this));
	}

	getDefaultLibLocation(): string {
		return dirname(this.getTypescript().getDefaultLibFilePath(this.getCompilationSettings()));
	}

	/**
	 * Gets the Custom Transformers to use, depending on the current emit mode
	 */
	getCustomTransformers(...extraTransformers: (CustomTransformersFunction | TS.CustomTransformers | undefined)[]): TS.CustomTransformers | undefined {
		const mergedTransformers = mergeTransformers(this.getTransformers(), ...extraTransformers);
		return mergedTransformers({
			program: this.getProgramInstance(),

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
		return compilationSettings.newLine != null
			? getNewLineCharacter(compilationSettings.newLine, this.getTypescript())
			: this.getFileSystem().newLine;
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
		return this.getFileSystem()
			.readDirectory(nativeNormalize(path), extensions, exclude, include, depth)
			.map(normalize);
	}

	resolveModuleNames(moduleNames: string[], containingFile: string): (TS.ResolvedModuleFull | undefined)[] {
		const resolvedModules: (TS.ResolvedModuleFull | undefined)[] = [];
		for (const moduleName of moduleNames) {
			// try to use standard resolution
			let result = resolveId({
				moduleResolutionHost: this,
				parent: containingFile,
				id: moduleName,
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

	resolveTypeReferenceDirectives(typeReferenceDirectiveNames: string[], containingFile: string): (TS.ResolvedTypeReferenceDirective | undefined)[] {
		const resolvedTypeReferenceDirectives: (TS.ResolvedTypeReferenceDirective | undefined)[] = [];
		for (const typeReferenceDirectiveName of typeReferenceDirectiveNames) {
			// try to use standard resolution
			let result = resolveId({
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
		this.options.parsedCommandLine.fileNames.forEach(file => {
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
