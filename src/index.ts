// tslint:disable:no-any

// @ts-ignore
import {transform} from "@babel/core";
import {join} from "path";
import {InputOptions, OutputBundle, OutputChunk, Plugin, RawSourceMap, RenderedChunk, SourceDescription} from "rollup";
// @ts-ignore
import {createFilter} from "rollup-pluginutils";
import {nodeModuleNameResolver, ParsedCommandLine, sys} from "typescript";
import {DECLARATION_EXTENSION} from "./constants";
import {FormatHost} from "./format-host";
import {ensureRelative, ensureTs, getBabelOptions, getDestinationFilePathFromRollupOutputOptions, getForcedCompilerOptions, includeFile, includeFileForTSEmit, isMainEntry, printDiagnostics, resolveTypescriptOptions, toTypescriptDeclarationFileExtension, userHasProvidedBabelOptions} from "./helpers";
import {IGenerateOptions} from "./i-generate-options";
import {ITypescriptLanguageServiceEmitResult, TypescriptLanguageServiceEmitResultKind} from "./i-typescript-language-service-emit-result";
import {ITypescriptLanguageServiceHost} from "./i-typescript-language-service-host";
import {ITypescriptPluginOptions} from "./i-typescript-plugin-options";
import {TypescriptLanguageServiceHost} from "./typescript-language-service-host";

/**
 * The name of the Rollup plugin
 * @type {string}
 */
const PLUGIN_NAME = "Typescript Rollup Plugin";

/**
 * A Rollup plugin that transpiles the given input with Typescript
 * @param {ITypescriptPluginOptions} [options={}]
 */
export default function typescriptRollupPlugin ({root = process.cwd(), tsconfig = "tsconfig.json", include = [], exclude = [], parseExternalModules = false, browserslist, babel = {}}: Partial<ITypescriptPluginOptions> = {}): Plugin {

	// Make sure to inform the user that if the user has provided babel options, they will be completely discarded if no Browserslist has been provided.
	if (userHasProvidedBabelOptions(babel) && browserslist == null) {
		throw new TypeError(`[${PLUGIN_NAME}]: You have provided options for Babel, but you have to also provide a Browserslist if you want Babel to handle transpilation.`);
	}

	/**
	 * The CompilerOptions to use with Typescript for individual files
	 * @type {ParsedCommandLine|null}
	 */
	let typescriptOptions: ParsedCommandLine|null = null;

	/**
	 * The Language Service Host to use with Typescript
	 * @type {ITypescriptLanguageServiceHost}
	 */
	let languageServiceHost: ITypescriptLanguageServiceHost|null = null;

	/**
	 * The host to use for formatting of diagnostics
	 * @type {null}
	 */
	let formatHost: FormatHost|null = null;

	/**
	 * The InputOptions provided tol Rollup
	 * @type {null}
	 */
	let inputRollupOptions: InputOptions|undefined;

	/**
	 * The file filter to use
	 * @type {Function}
	 */
	const filter: (fileName: string) => boolean = createFilter(include, exclude);

	/**
	 * The file names that has been passed through Rollup and into this plugin
	 * @type {Set<string>}
	 */
	const transformedFileNames: Set<string> = new Set();

	/**
	 * A Map between .[m]js and the .ts files that has been generated for them.
	 * This is in order to allow the LanguageService to accept .[m]js files by
	 * "faking" their .ts extension
	 * @type {Map<string, string>}
	 */
	const tsFileToRawFileMap: Map<string, string> = new Map();

	/**
	 * Holds true if babel should be used
	 * @type {boolean}
	 */
	const USE_BABEL = browserslist != null;

	return {
		name: PLUGIN_NAME,

		options (options: InputOptions): void {
			inputRollupOptions = options;
		},

		/**
		 * Renders a chunk. If Babel transpilation is active, that's what we're gonna use
		 * @param {string} code
		 * @param {RenderedChunk} chunk
		 * @returns {Promise<object | void>}
		 */
		async renderChunk (code: string, chunk: RenderedChunk): Promise<{ code: string; map: RawSourceMap }|void> {
			if (!USE_BABEL) return;

			// Convert the file into a relative path
			const relativePath = ensureRelative(root, chunk.fileName);
			const relativeWithTsExtension = ensureTs(relativePath);
			const mainEntry = isMainEntry(root, chunk.fileName, inputRollupOptions);

			const emitResults = await new Promise<ITypescriptLanguageServiceEmitResult[]>((resolve, reject) => {
				transform(code, getBabelOptions({
					filename: chunk.fileName,
					relativeFilename: relativeWithTsExtension,
					typescriptOptions: typescriptOptions!,
					browserslist: browserslist!,
					...babel
				}), (err: Error, result: any) => {
					if (err != null) return reject(err);
					return resolve([
						{
							kind: TypescriptLanguageServiceEmitResultKind.MAP,
							fileName: chunk.fileName,
							isMainEntry: mainEntry,
							text: result.map
						},
						{
							kind: TypescriptLanguageServiceEmitResultKind.SOURCE,
							fileName: chunk.fileName,
							isMainEntry: mainEntry,
							text: result.code
						}
					]);
				});
			});

			// Find the emit result that references the source code
			const sourceResult = emitResults.find(emitResult => emitResult.kind === TypescriptLanguageServiceEmitResultKind.SOURCE)!;
			// Find the emit result that references the SourceMap
			const mapResult = emitResults.find(emitResult => emitResult.kind === TypescriptLanguageServiceEmitResultKind.MAP)!;

			return {
				code: sourceResult.text,
				map: <any> mapResult.text
			};
		},

		/**
		 * Invoked when a bundle has been generated
		 */
		async generateBundle (outputOptions: IGenerateOptions, bundle: OutputBundle): Promise<void> {
			if (languageServiceHost == null) return;

			// Take all of the generated Ids
			const transformedIds: Set<string> = new Set([].concat.apply([], Object.values(bundle)
				.filter(value => typeof value !== "string" && "modules" in value)
				.map((value: OutputChunk) => Object.keys(value.modules).map(module => ensureRelative(root, module)))));

			// Clear all file names from the Set of transformed file names that has since been removed from Rollup compilation
			const removedFileNames: Set<string> = new Set();
			for (const fileName of transformedFileNames) {
				if (!transformedIds.has(fileName)) {
					removedFileNames.add(fileName);
					transformedFileNames.delete(fileName);
				}
			}

			// Remove all removed filenames from the LanguageService
			removedFileNames.forEach(fileName => {
				const fileNameWithTsExtension = ensureTs(fileName);
				tsFileToRawFileMap.delete(fileNameWithTsExtension);
				languageServiceHost!.removeFile(fileNameWithTsExtension);
			});

			// Take all file names from the language service
			const languageServiceFileNames = languageServiceHost.getScriptFileNames();

			if (formatHost != null) {
				printDiagnostics(languageServiceHost.getAllDiagnostics(), formatHost);
			}

			// Do no more if the compiler options are somehow not defined
			if (typescriptOptions == null) return;

			// If declarations should be emitted, make sure to do so
			if (typescriptOptions.options.declaration != null && typescriptOptions.options.declaration) {

				// Temporarily swap the CompilerOptions for the LanguageService
				const oldOptions = languageServiceHost.getTypescriptOptions();
				const declarationOptions = await resolveTypescriptOptions(root, tsconfig, getForcedCompilerOptions(root, USE_BABEL, inputRollupOptions, outputOptions));
				languageServiceHost.setTypescriptOptions(declarationOptions);

				// Emit all declaration output files
				const outputFiles: ITypescriptLanguageServiceEmitResult[] = [].concat.apply([], languageServiceFileNames.map(fileName => languageServiceHost!.emit(fileName, true)));
				const mainEntries = outputFiles.filter(file => file.isMainEntry);
				const otherFiles = outputFiles.filter(file => !file.isMainEntry);

				// Reset the compilation settings
				languageServiceHost.setTypescriptOptions(oldOptions);

				// Write all other files
				otherFiles.forEach(file => {
					sys.writeFile(join(root, toTypescriptDeclarationFileExtension(file.fileName)), file.text);
				});

				// Concatenate all main entry files and rewrite their file names
				sys.writeFile(
					join(root, toTypescriptDeclarationFileExtension(getDestinationFilePathFromRollupOutputOptions(root, outputOptions))),
					mainEntries
						.map(mainEntry => mainEntry.text)
						.join("\n")
				);
			}
		},

		/**
		 * Transforms the given code and file
		 * @param {string} code
		 * @param {string} file
		 * @returns {Promise<SourceDescription | undefined>}
		 */
		async transform (code: string, file: string): Promise<SourceDescription|undefined> {
			// Convert the file into a relative path
			const relativePath = ensureRelative(root, file);

			// Make sure that the compiler options are in fact defined
			if (typescriptOptions == null) {
				typescriptOptions = await resolveTypescriptOptions(
					root,
					tsconfig,
					getForcedCompilerOptions(root, USE_BABEL, inputRollupOptions)
				);
			}

			// Assert that the file passes the filter
			const shouldIncludeFile = includeFile(file, filter);
			const shouldIncludeForTSEmit = includeFileForTSEmit(file, filter);
			if (!shouldIncludeFile) {
				return undefined;
			}

			// Add the file name to the Set of files that has been passed through this plugin
			transformedFileNames.add(relativePath);

			// Make sure that the file has a .ts extension (even if it is a .[m]js file)
			const relativeWithTsExtension = ensureTs(relativePath);
			tsFileToRawFileMap.set(relativeWithTsExtension, relativePath);

			// Make sure that the LanguageServiceHost is in fact defined
			if (languageServiceHost == null) {
				languageServiceHost = new TypescriptLanguageServiceHost(root, parseExternalModules, tsFileToRawFileMap, typescriptOptions);
				formatHost = new FormatHost(languageServiceHost, root);
			}

			// Add the file to the LanguageServiceHost
			const mainEntry = isMainEntry(root, file, inputRollupOptions);

			if (shouldIncludeForTSEmit) {
				languageServiceHost.addFile({fileName: relativeWithTsExtension, text: code, isMainEntry: mainEntry});
			}

			let emitResults: ITypescriptLanguageServiceEmitResult[];

			// Otherwise, if the file shouldn't emit with Typescript, return undefined
			if (!shouldIncludeForTSEmit) {
				return undefined;
			}

			// Run it through Typescript
			else {
				// Take all emit results for that file
				emitResults = languageServiceHost.emit(relativeWithTsExtension);
			}

			// Find the emit result that references the source code
			const sourceResult = emitResults.find(emitResult => emitResult.kind === TypescriptLanguageServiceEmitResultKind.SOURCE)!;
			// Find the emit result that references the SourceMap
			const mapResult = emitResults.find(emitResult => emitResult.kind === TypescriptLanguageServiceEmitResultKind.MAP)!;

			return {
				code: sourceResult.text,
				...(mapResult == null ? {} : {map: mapResult.text})
			};
		},

		/**
		 * Resolves an id
		 * @param {string} importee
		 * @param {string} importer
		 * @returns {string|void}
		 */
		resolveId (importee: string, importer: string|undefined): string|void {
			// If the CompilerOptions are undefined somehow, do nothing
			if (typescriptOptions == null) return;

			// Make sure there is an importer, otherwise return void
			if (importer == null) return;

			// Normalize the importer across each OS
			const normalizedImporter = importer.split("\\").join("/");

			// Resolve the module
			const match = nodeModuleNameResolver(importee, normalizedImporter, typescriptOptions.options, sys);

			// If it wasn't successful, return void
			if (match.resolvedModule == null) return;

			// Unpack the resolved module
			const {resolvedFileName} = match.resolvedModule;

			// Otherwise, if the resolved filename is a declaration file, return void
			if (resolvedFileName.endsWith(DECLARATION_EXTENSION)) return;

			// Return the resolved file name
			return resolvedFileName;
		}

	};
}