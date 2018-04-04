// tslint:disable:no-any
// tslint:disable:no-default-export

import {join} from "path";
import {InputOptions, OutputOptions, Plugin, SourceDescription} from "rollup";
// @ts-ignore
import {createFilter} from "rollup-pluginutils";
import {nodeModuleNameResolver, ParsedCommandLine, sys} from "typescript";
import {DECLARATION_EXTENSION, TSLIB, TYPESCRIPT_EXTENSION} from "./constants";
import {FormatHost} from "./format-host";
import {ensureRelative, getDestinationFilePathFromRollupOutputOptions, getForcedCompilerOptions, isMainEntry, printDiagnostics, resolveTypescriptOptions, toTypescriptDeclarationFileExtension} from "./helpers";
import {ITypescriptLanguageServiceEmitResult, TypescriptLanguageServiceEmitResultKind} from "./i-typescript-language-service-emit-result";
import {ITypescriptLanguageServiceHost} from "./i-typescript-language-service-host";
import {ITypescriptPluginOptions} from "./i-typescript-plugin-options";
import {TypescriptLanguageServiceHost} from "./typescript-language-service-host";


/**
 * A Rollup plugin that transpiles the given input with Typescript
 * @param {ITypescriptPluginOptions} [options={}]
 */
export default function typescriptRollupPlugin ({root = process.cwd(), tsconfig = "tsconfig.json", noEmit = false, include = [], exclude = [], parseExternalModules = false}: Partial<ITypescriptPluginOptions> = {}): Plugin {

	/**
	 * The CompilerOptions to use with Typescript for individual files
	 * @type {ParsedCommandLine|null}
	 */
	let typescriptOptions: ParsedCommandLine | null = null;

	/**
	 * The Language Service Host to use with Typescript
	 * @type {ITypescriptLanguageServiceHost}
	 */
	let languageServiceHost: ITypescriptLanguageServiceHost | null = null;

	/**
	 * The host to use for formatting of diagnostics
	 * @type {null}
	 */
	let formatHost: FormatHost | null = null;

	/**
	 * The InputOptions provided tol Rollup
	 * @type {null}
	 */
	let inputRollupOptions: InputOptions | undefined;


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

	return {
		name: "Typescript Rollup Plugin",

		options (options: InputOptions): void {
			inputRollupOptions = options;
		},

		/**
		 * Invoked when a bundle has been written to disk
		 */
		async ongenerate (outputOptions: OutputOptions & { bundle: { modules: { id: string }[] } }): Promise<void> {
			if (languageServiceHost == null) return;

			// Take all of the generated Ids
			const generatedIds = new Set(outputOptions.bundle.modules.map(module => ensureRelative(root, module.id)));

			// Clear all file names from the Set of transformed file names that has since been removed from Rollup compilation
			const removedFileNames: Set<string> = new Set();
			for (const fileName of transformedFileNames) {
				if (!generatedIds.has(fileName)) {
					removedFileNames.add(fileName);
					transformedFileNames.delete(fileName);
				}
			}

			// Remove all removed filenames from the LanguageService
			removedFileNames.forEach(fileName => languageServiceHost!.removeFile(fileName));

			// Take all file names from the language service
			const languageServiceFileNames = languageServiceHost.getScriptFileNames();

			if (formatHost != null) {
				printDiagnostics(languageServiceHost.getAllDiagnostics(), formatHost);
			}

			// Do no more if the compiler options are somehow not defined
			if (typescriptOptions == null) return;

			// If declarations should be emitted, make sure to do so
			if (!noEmit && typescriptOptions != null && typescriptOptions.options.declaration != null && typescriptOptions.options.declaration) {

				// Temporarily swap the CompilerOptions for the LanguageService
				const oldOptions = languageServiceHost.getTypescriptOptions();
				const declarationOptions = await resolveTypescriptOptions(root, tsconfig, getForcedCompilerOptions(root, inputRollupOptions, outputOptions));
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
		async transform (code: string, file: string): Promise<SourceDescription | undefined> {
			// Convert the file into a relative path
			const relativePath = ensureRelative(root, file);

			// Assert that the file passes the filter
			if (!filter(file) || !file.endsWith(TYPESCRIPT_EXTENSION)) {
				return undefined;
			}

			// Add the file name to the Set of files that has been passed through this plugin
			transformedFileNames.add(relativePath);

			// Make sure that the compiler options are in fact defined
			if (typescriptOptions == null) {
				typescriptOptions = await resolveTypescriptOptions(root, tsconfig, getForcedCompilerOptions(root, inputRollupOptions));
			}

			// Make sure that the LanguageServiceHost is in fact defined
			if (languageServiceHost == null) {
				languageServiceHost = new TypescriptLanguageServiceHost(root, parseExternalModules, typescriptOptions);
				formatHost = new FormatHost(languageServiceHost, root);
			}

			// Add the file to the LanguageServiceHost
			languageServiceHost.addFile({fileName: relativePath, text: code, isMainEntry: isMainEntry(root, file, inputRollupOptions)});

			// Take all emit results for that file
			const emitResults = languageServiceHost.emit(relativePath);

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
		 * Resolves an id
		 * @param {string} importee
		 * @param {string} importer
		 * @returns {string|void}
		 */
		resolveId (importee: string, importer: string | undefined): string | void {
			// If the CompilerOptions are undefined somehow, do nothing
			if (typescriptOptions == null) return;

			// If the imported module is tslib, do nothing
			if (importee === TSLIB) {
				return "\0" + TSLIB;
			}

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