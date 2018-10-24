import {InputOptions, OutputBundle, OutputOptions, Plugin, PluginContext, RawSourceMap, RenderedChunk, TransformSourceDescription} from "rollup";
import {CompilerOptions, createDocumentRegistry, createLanguageService, LanguageService, ModuleKind, ParsedCommandLine} from "typescript";
import {getParsedCommandLine} from "../util/get-parsed-command-line/get-parsed-command-line";
import {getForcedCompilerOptions} from "../util/get-forced-compiler-options/get-forced-compiler-options";
import {IncrementalLanguageService} from "../service/language-service/incremental-language-service";
import {getSourceDescriptionFromEmitOutput} from "../util/get-source-description-from-emit-output/get-source-description-from-emit-output";
import {IEmitCache} from "../service/cache/emit-cache/i-emit-cache";
import {EmitCache} from "../service/cache/emit-cache/emit-cache";
import {emitDeclarations} from "../util/emit-declarations/emit-declarations";
import {emitDiagnosticsThroughRollup} from "../util/diagnostic/emit-diagnostics-through-rollup";
import {getSupportedExtensions} from "../util/get-supported-extensions/get-supported-extensions";
import {ensureRelative, getExtension, isNonTransformableBabelHelper} from "../util/path/path-util";
import {ModuleResolutionHost} from "../service/module-resolution-host/module-resolution-host";
import {takeBundledFilesNames} from "../util/take-bundled-filenames/take-bundled-filenames";
import {TypescriptPluginOptions} from "./i-typescript-plugin-options";
import {getPluginOptions} from "../util/plugin-options/get-plugin-options";
import {IBabelConfig} from "./i-babel-options";
import {getBabelConfig} from "../util/get-babel-config/get-babel-config";
import {getForcedBabelOptions} from "../util/get-forced-babel-options/get-forced-babel-options";
import {getBrowserslist} from "../util/get-browserslist/get-browserslist";
import {IResolveCache} from "../service/cache/resolve-cache/i-resolve-cache";
import {ResolveCache} from "../service/cache/resolve-cache/resolve-cache";
import {REGENERATOR_RUNTIME_NAME_1, REGENERATOR_RUNTIME_NAME_2} from "../constant/constant";
import {REGENERATOR_SOURCE} from "../lib/regenerator/regenerator";
import {getDefaultBabelOptions} from "../util/get-default-babel-options/get-default-babel-options";
// @ts-ignore
import {transformAsync} from "@babel/core";
// @ts-ignore
import {createFilter} from "rollup-pluginutils";
import {generateRandomHash} from "../util/hash/generate-random-hash";
import {DeclarationCompilerHost} from "../service/compiler-host/declaration-compiler-host";
import {resolveId} from "../util/resolve-id/resolve-id";
import {mergeTransformers} from "../util/merge-transformers/merge-transformers";
import {getTypeOnlyImportTransformers} from "../service/transformer/type-only-import-transformer";

/**
 * The name of the Rollup plugin
 * @type {string}
 */
const PLUGIN_NAME = "Typescript";

/**
 * A Rollup plugin that transpiles the given input with Typescript
 * @param {TypescriptPluginOptions} [pluginInputOptions={}]
 */
export default function typescriptRollupPlugin (pluginInputOptions: Partial<TypescriptPluginOptions> = {}): Plugin {
	const pluginOptions: TypescriptPluginOptions = getPluginOptions(pluginInputOptions);
	const {include, exclude, tsconfig, transformers, cwd, browserslist} = pluginOptions;
	// Make sure to normalize the received Browserslist
	const normalizedBrowserslist = getBrowserslist({browserslist, cwd});

	/**
	 * The ParsedCommandLine to use with Typescript
	 * @type {ParsedCommandLine?}
	 */
	let parsedCommandLine: ParsedCommandLine;

	/**
	 * The Compiler options to use with declaration files
	 * @type {CompilerOptions?}
	 */
	let declarationCompilerOptions: CompilerOptions|undefined;

	/**
	 * The config to use with Babel, if Babel should transpile source code
	 * @type {IBabelConfig}
	 */
	let babelConfig: IBabelConfig|undefined;

	/**
	 * If babel are to be used, and if one or more minify presets/plugins has been passed, this config will be used
	 * @type {boolean}
	 */
	let babelMinifyConfig: IBabelConfig|undefined;

	/**
	 * The (Incremental) LanguageServiceHost to use
	 * @type {IncrementalLanguageService?}
	 */
	let languageServiceHost: IncrementalLanguageService;

	/**
	 * The host to use for when resolving modules
	 * @type {ModuleResolutionHost}
	 */
	let moduleResolutionHost: ModuleResolutionHost;

	/**
	 * The CompilerHost to use for declaration files, if any
	 * @type {DeclarationCompilerHost?}
	 */
	let declarationCompilerHost: DeclarationCompilerHost|undefined;

	/**
	 * The LanguageService to use
	 * @type {LanguageService?}
	 */
	let languageService: LanguageService;

	/**
	 * The EmitCache to use
	 * @type {EmitCache}
	 */
	const emitCache: IEmitCache = new EmitCache();

	/**
	 * The ResolveCache to use
	 * @type {ResolveCache}
	 */
	const resolveCache: IResolveCache = new ResolveCache();

	/**
	 * The filter function to use
	 */
	const filter: (id: string) => boolean = createFilter(include, exclude);

	/**
	 * All supported extensions
	 * @type {string[]}
	 */
	let SUPPORTED_EXTENSIONS: string[];

	/**
	 * The InputOptions provided to Rollup
	 * @type {InputOptions}
	 */
	let rollupInputOptions: InputOptions;

	return {
		name: PLUGIN_NAME,

		/**
		 * Invoked when Input options has been received by Rollup
		 * @param {InputOptions} options
		 */
		options (options: InputOptions): void {
			// Break if we've already received options
			if (rollupInputOptions != null) return;

			rollupInputOptions = options;

			// Make sure we have a proper ParsedCommandLine to work with
			parsedCommandLine = getParsedCommandLine({
				tsconfig,
				forcedCompilerOptions: getForcedCompilerOptions({pluginOptions, rollupInputOptions, browserslist: normalizedBrowserslist}),
				cwd
			});

			if (Boolean(parsedCommandLine.options.declaration)) {
				declarationCompilerOptions = {
					...parsedCommandLine.options,
					// outFile only supports SystemJS and AMD
					outFile: generateRandomHash(),
					module: ModuleKind.System
				};
			}

			// Prepare a Babel config if Babel should be the transpiler
			if (pluginOptions.transpiler === "babel") {
				const babelConfigResult = getBabelConfig({
					babelConfig: pluginOptions.babelConfig,
					cwd,
					forcedOptions: getForcedBabelOptions({cwd, pluginOptions, rollupInputOptions, browserslist: normalizedBrowserslist}),
					defaultOptions: getDefaultBabelOptions({pluginOptions, rollupInputOptions, browserslist: normalizedBrowserslist})
				});
				babelConfig = babelConfigResult.config;
				babelMinifyConfig = babelConfigResult.minifyConfig;
			}

			SUPPORTED_EXTENSIONS = getSupportedExtensions(
				Boolean(parsedCommandLine.options.allowJs),
				Boolean(parsedCommandLine.options.resolveJsonModule)
			);

			// Hook up a LanguageServiceHost and a LanguageService
			languageServiceHost = new IncrementalLanguageService({
				parsedCommandLine,
				transformers: mergeTransformers(transformers, getTypeOnlyImportTransformers()),
				cwd,
				emitCache,
				rollupInputOptions,
				supportedExtensions: SUPPORTED_EXTENSIONS
			});
			languageService = createLanguageService(languageServiceHost, createDocumentRegistry(languageServiceHost.useCaseSensitiveFileNames(), languageServiceHost.getCurrentDirectory()));

			// Hook up a new ModuleResolutionHost
			moduleResolutionHost = new ModuleResolutionHost({languageServiceHost, extensions: SUPPORTED_EXTENSIONS});
			// Hook up a new DeclarationCompilerHost
			declarationCompilerHost = new DeclarationCompilerHost({moduleResolutionHost, languageServiceHost, languageService});
		},

		/**
		 * Renders the given chunk. Will emit declaration files if the Typescript config says so.
		 * Will also apply any minification via Babel if a minification plugin or preset has been provided,
		 * and if Babel is the chosen transpiler. Otherwise, it will simply do nothing
		 * @param {string} code
		 * @param {RenderedChunk} chunk
		 * @param {OutputOptions} outputOptions
		 * @returns {Promise<{ code: string, map: RawSourceMap } | void>}
		 */
		async renderChunk (this: PluginContext, code: string, chunk: RenderedChunk, outputOptions: OutputOptions): Promise<{ code: string; map: RawSourceMap }|void> {

			// Emit declaration files if required
			if (Boolean(parsedCommandLine.options.declaration) && declarationCompilerOptions != null && declarationCompilerHost != null) {
				emitDeclarations({
					chunk,
					cwd,
					outputOptions,
					compilerOptions: parsedCommandLine.options,
					declarationCompilerOptions,
					compilerHost: declarationCompilerHost
				});
			}

			// Emit all reported diagnostics
			Object.keys(chunk.modules).forEach(file => emitDiagnosticsThroughRollup({languageServiceHost, languageService, file, context: this}));

			// Don't proceed if there is no minification config
			if (babelMinifyConfig == null) return;

			const transpilationResult = await transformAsync(
				code,
				{
					...babelMinifyConfig,
					filename: chunk.fileName,
					filenameRelative: ensureRelative(cwd, chunk.fileName)
				}
			);

			// Return the results
			return {
				code: transpilationResult.code,
				map: transpilationResult.map == null ? undefined : transpilationResult.map
			};
		},

		/**
		 * Transforms the given code and file
		 * @param {string} code
		 * @param {string} file
		 * @returns {Promise<TransformSourceDescription?>}
		 */
		async transform (this: PluginContext, code: string, file: string): Promise<TransformSourceDescription|undefined> {

			// Skip the file if it doesn't match the filter or if the helper cannot be transformed
			if (!filter(file) || isNonTransformableBabelHelper(file)) {
				return undefined;
			}

			// Only pass the file through Typescript if it's extension is supported. Otherwise, if we're going to continue on with Babel,
			// Mock a SourceDescription. Otherwise, return bind undefined
			const sourceDescription = !SUPPORTED_EXTENSIONS.includes(getExtension(file))
				? babelConfig != null ? {code, map: undefined} : undefined
				: (() => {
					// Remove the file from the resolve cache, now that it has changed.
					resolveCache.delete(file);

					// Add the file to the LanguageServiceHost
					languageServiceHost.addFile({file, code});

					// Get some EmitOutput, optionally from the cache if the file contents are unchanged
					const emitOutput = emitCache.get({fileName: file, languageService});

					// Emit all reported diagnostics
					emitDiagnosticsThroughRollup({languageServiceHost, languageService, file, context: this});

					// Return the emit output results to Rollup
					return getSourceDescriptionFromEmitOutput(emitOutput);
				})();

			// If nothing was emitted, simply return undefined
			if (sourceDescription == null) {
				return undefined;
			}

			// If Babel shouldn't be used, simply return the emitted results
			else if (babelConfig == null) {
				return sourceDescription;
			}

			// Otherwise, pass it on to Babel to perform the rest of the transpilation steps
			else {
				const transpilationResult = await transformAsync(
					sourceDescription.code,
					{
						...babelConfig,
						filename: file,
						filenameRelative: ensureRelative(cwd, file),
						inputSourceMap: typeof sourceDescription.map === "string"
							? JSON.parse(sourceDescription.map)
							: sourceDescription.map
					}
				);

				// Return the results
				return {
					code: transpilationResult.code,
					map: transpilationResult.map == null ? undefined : transpilationResult.map
				};
			}
		},

		/**
		 * Attempts to resolve the given id via the LanguageServiceHost
		 * @param {string} id
		 * @param {string} parent
		 * @returns {string | void}
		 */
		resolveId (this: PluginContext, id: string, parent: string|undefined): string|void {
			// Don't proceed if there is no parent (in which case this is an entry module)
			if (parent == null) return;

			return resolveId({id, parent, cwd, options: parsedCommandLine.options, moduleResolutionHost, resolveCache});
		},

		/**
		 * Optionally loads the given id. Is used to swap out the regenerator-runtime implementation used by babel
		 * to use one that is using ESM by default to play nice with Rollup even when rollup-plugin-commonjs isn't
		 * being used
		 * @param {string} id
		 * @returns {string | void}
		 */
		load (this: PluginContext, id: string): string|void {
			// Return the alternative source for the regenerator runtime if that file is attempted to be loaded
			if (id.endsWith(REGENERATOR_RUNTIME_NAME_1) || id.endsWith(REGENERATOR_RUNTIME_NAME_2)) {
				return REGENERATOR_SOURCE;
			}
		},

		/**
		 * Invoked when a full bundle is generated. Will take all modules for all chunks and make sure to remove all removed files
		 * from the LanguageService
		 * @param {OutputOptions} _
		 * @param {OutputBundle} bundle
		 * @returns {void | Promise<void>}
		 */
		generateBundle (this: PluginContext, _: OutputOptions, bundle: OutputBundle): void {

			const bundledFilenames = takeBundledFilesNames(bundle);

			// Walk through all of the files of the LanguageService and make sure to remove them if they are not part of the bundle
			for (const fileName of languageServiceHost.publicFiles) {
				if (!bundledFilenames.has(fileName)) {
					languageServiceHost.deleteFile(fileName);
				}
			}
		}
	};
}