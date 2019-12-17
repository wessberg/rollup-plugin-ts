import {InputOptions, OutputBundle, OutputOptions, Plugin, PluginContext, RenderedChunk, SourceMap, TransformSourceDescription} from "rollup";
import {getParsedCommandLine} from "../util/get-parsed-command-line/get-parsed-command-line";
import {getForcedCompilerOptions} from "../util/get-forced-compiler-options/get-forced-compiler-options";
import {IncrementalLanguageService} from "../service/language-service/incremental-language-service";
import {getSourceDescriptionFromEmitOutput} from "../util/get-source-description-from-emit-output/get-source-description-from-emit-output";
import {IEmitCache} from "../service/cache/emit-cache/i-emit-cache";
import {EmitCache} from "../service/cache/emit-cache/emit-cache";
import {emitDiagnosticsThroughRollup} from "../util/diagnostic/emit-diagnostics-through-rollup";
import {getSupportedExtensions} from "../util/get-supported-extensions/get-supported-extensions";
import {ensureRelative, getExtension, isBabelHelper, isRollupPluginMultiEntry, isTslib, nativeNormalize} from "../util/path/path-util";
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
import {resolveId} from "../util/resolve-id/resolve-id";
import {mergeTransformers} from "../util/merge-transformers/merge-transformers";
import {ensureArray} from "../util/ensure-array/ensure-array";
import {GetParsedCommandLineResult} from "../util/get-parsed-command-line/get-parsed-command-line-result";
import {takeBrowserslistOrComputeBasedOnCompilerOptions} from "../util/take-browserslist-or-compute-based-on-compiler-options/take-browserslist-or-compute-based-on-compiler-options";
import {matchAll} from "@wessberg/stringutil";
import {Resolver} from "../util/resolve-id/resolver";
import {emitDeclarations} from "../declaration/emit-declarations";
import {TS} from "../type/ts";

/**
 * The name of the Rollup plugin
 */
const PLUGIN_NAME = "Typescript";

/**
 * A Rollup plugin that transpiles the given input with Typescript
 */
export default function typescriptRollupPlugin(pluginInputOptions: Partial<TypescriptPluginOptions> = {}): Plugin {
	const pluginOptions: TypescriptPluginOptions = getPluginOptions(pluginInputOptions);
	const {include, exclude, tsconfig, cwd, resolveTypescriptLibFrom, browserslist, typescript, fileSystem, transpileOnly} = pluginOptions;
	const transformers = pluginOptions.transformers == null ? [] : ensureArray(pluginOptions.transformers);
	// Make sure to normalize the received Browserslist
	const normalizedBrowserslist = getBrowserslist({browserslist, cwd, fileSystem});

	/**
	 * The ParsedCommandLine to use with Typescript
	 */
	let parsedCommandLineResult: GetParsedCommandLineResult;

	/**
	 * The config to use with Babel, if Babel should transpile source code
	 */
	let babelConfig: ((filename: string) => IBabelConfig) | undefined;

	/**
	 * If babel is to be used, and if one or more minify presets/plugins has been passed, this config will be used
	 */
	let babelMinifyConfig: ((filename: string) => IBabelConfig) | undefined;

	/**
	 * If babel is to be used, and if one or more minify presets/plugins has been passed, this will be true
	 */
	let hasBabelMinifyOptions: boolean = false;

	/**
	 * The (Incremental) LanguageServiceHost to use
	 */
	let languageServiceHost: IncrementalLanguageService;

	/**
	 * The host to use for when resolving modules
	 */
	let moduleResolutionHost: ModuleResolutionHost;

	/**
	 * The LanguageService to use
	 */
	let languageService: TS.LanguageService;

	/**
	 * A function that given an id and a parent resolves the full path for a dependency. The Module Resolution Algorithm depends on the CompilerOptions as well
	 * as the supported extensions
	 */
	let resolver: Resolver;

	/**
	 * A function that given an id and a parent resolves the full path for a dependency, prioritizing ambient files (.d.ts). The Module Resolution Algorithm depends on the CompilerOptions as well
	 * as the supported extensions
	 */
	let ambientResolver: Resolver;

	/**
	 * The EmitCache to use
	 */
	const emitCache: IEmitCache = new EmitCache();

	/**
	 * The ResolveCache to use
	 */
	const resolveCache: IResolveCache = new ResolveCache({fileSystem});

	/**
	 * The filter function to use
	 */
	const filter: (id: string) => boolean = createFilter(include, exclude);

	/**
	 * The Set of all transformed files.
	 */
	let transformedFiles = new Set<string>();

	/**
	 * All supported extensions
	 */
	let SUPPORTED_EXTENSIONS: Set<string>;

	/**
	 * The InputOptions provided to Rollup
	 */
	let rollupInputOptions: InputOptions;

	/**
	 * A Set of the entry filenames for when using rollup-plugin-multi-entry (we need to track this for generating valid declarations)
	 */
	let MULTI_ENTRY_FILE_NAMES: Set<string> | undefined;

	/**
	 * Returns true if Typescript can emit something for the given file
	 */
	let canEmitForFile: (id: string) => boolean;

	return {
		name: PLUGIN_NAME,

		/**
		 * Invoked when Input options has been received by Rollup
		 */
		options(options: InputOptions): undefined {
			// Break if the options aren't different from the previous ones
			if (options === rollupInputOptions) return;

			// Re-assign the input options
			rollupInputOptions = options;

			// Clear resolve-related caches
			resolveCache.clear();

			// Make sure we have a proper ParsedCommandLine to work with
			parsedCommandLineResult = getParsedCommandLine({
				tsconfig,
				cwd,
				fileSystem,
				typescript,
				forcedCompilerOptions: getForcedCompilerOptions({pluginOptions, rollupInputOptions, browserslist: normalizedBrowserslist})
			});

			// Prepare a Babel config if Babel should be the transpiler
			if (pluginOptions.transpiler === "babel") {
				// A browserslist may already be provided, but if that is not the case, one can be computed based on the "target" from the tsconfig
				const computedBrowserslist = takeBrowserslistOrComputeBasedOnCompilerOptions(
					normalizedBrowserslist,
					parsedCommandLineResult.originalCompilerOptions,
					typescript
				);

				const babelConfigResult = getBabelConfig({
					cwd,
					babelConfig: pluginOptions.babelConfig,
					forcedOptions: getForcedBabelOptions({cwd, pluginOptions, rollupInputOptions, browserslist: computedBrowserslist}),
					defaultOptions: getDefaultBabelOptions({pluginOptions, rollupInputOptions, browserslist: computedBrowserslist}),
					browserslist: computedBrowserslist,
					rollupInputOptions
				});
				babelConfig = babelConfigResult.config;
				babelMinifyConfig = babelConfigResult.minifyConfig;
				hasBabelMinifyOptions = babelConfigResult.hasMinifyOptions;
			}

			SUPPORTED_EXTENSIONS = getSupportedExtensions(
				Boolean(parsedCommandLineResult.parsedCommandLine.options.allowJs),
				Boolean(parsedCommandLineResult.parsedCommandLine.options.resolveJsonModule)
			);

			canEmitForFile = (id: string) => filter(id) && SUPPORTED_EXTENSIONS.has(getExtension(id));

			const resolve = (id: string, parent: string) =>
				resolveId({
					id,
					parent,
					cwd,
					options: parsedCommandLineResult.parsedCommandLine.options,
					moduleResolutionHost,
					resolveCache,
					typescript,
					supportedExtensions: SUPPORTED_EXTENSIONS
				});

			resolver = (id: string, parent: string) => {
				const resolved = resolve(id, parent);

				return resolved == null || resolved.resolvedFileName == null
					? undefined
					: {
							fileName: resolved.resolvedFileName,
							isExternalLibrary: resolved.isExternalLibraryImport === true
					  };
			};

			ambientResolver = (id: string, parent: string) => {
				const resolved = resolve(id, parent);
				return resolved == null || (resolved.resolvedAmbientFileName == null && resolved.resolvedFileName == null)
					? undefined
					: {
							fileName: resolved.resolvedAmbientFileName ?? resolved.resolvedFileName!,
							isExternalLibrary: resolved.isExternalLibraryImport === true
					  };
			};

			// Hook up a LanguageServiceHost and a LanguageService
			languageServiceHost = new IncrementalLanguageService({
				cwd,
				resolveTypescriptLibFrom,
				emitCache,
				resolveCache,
				rollupInputOptions,
				fileSystem,
				typescript,
				supportedExtensions: SUPPORTED_EXTENSIONS,
				parsedCommandLine: parsedCommandLineResult.parsedCommandLine,
				transformers: mergeTransformers(...transformers),
				languageService: () => languageService
			});

			languageService = typescript.createLanguageService(
				languageServiceHost,
				typescript.createDocumentRegistry(languageServiceHost.useCaseSensitiveFileNames(), languageServiceHost.getCurrentDirectory())
			);

			// Hook up a new ModuleResolutionHost
			moduleResolutionHost = new ModuleResolutionHost({languageServiceHost, extensions: SUPPORTED_EXTENSIONS});

			return undefined;
		},

		/**
		 * Renders the given chunk. Will emit declaration files if the Typescript config says so.
		 * Will also apply any minification via Babel if a minification plugin or preset has been provided,
		 * and if Babel is the chosen transpiler. Otherwise, it will simply do nothing
		 */
		async renderChunk(this: PluginContext, code: string, chunk: RenderedChunk): Promise<{code: string; map: SourceMap} | null> {
			// Don't proceed if there is no minification config
			if (!hasBabelMinifyOptions || babelMinifyConfig == null) return null;

			const transpilationResult = await transformAsync(code, {
				...babelMinifyConfig(chunk.fileName),
				filename: chunk.fileName,
				filenameRelative: ensureRelative(cwd, chunk.fileName)
			});

			// Return the results
			return {
				code: transpilationResult.code,
				map: transpilationResult.map == null ? undefined : transpilationResult.map
			};
		},

		/**
		 * Transforms the given code and file
		 */
		async transform(this: PluginContext, code: string, file: string): Promise<TransformSourceDescription | undefined> {
			// If this file represents ROLLUP_PLUGIN_MULTI_ENTRY, we need to parse its' contents to understand which files it aliases.
			// Following that, there's nothing more to do
			if (isRollupPluginMultiEntry(file)) {
				MULTI_ENTRY_FILE_NAMES = new Set(matchAll(code, /(import|export)\s*(\*\s*from\s*)?["'`]([^"'`]*)["'`]/).map(([, , , path]) => path));
				return undefined;
			}

			// Skip the file if it doesn't match the filter or if the helper cannot be transformed
			if (!filter(file) || isBabelHelper(file)) {
				return undefined;
			}

			// Only pass the file through Typescript if it's extension is supported. Otherwise, if we're going to continue on with Babel,
			// Mock a SourceDescription. Otherwise, return bind undefined
			let sourceDescription = !canEmitForFile(file)
				? babelConfig != null
					? {code, map: undefined}
					: undefined
				: (() => {
						if (transformedFiles.has(file)) {
							// Remove the file from the resolve cache, now that it has changed.
							resolveCache.delete(file);
						}

						// Add the file to the LanguageServiceHost
						languageServiceHost.addFile({file, code});

						// Get some EmitOutput, optionally from the cache if the file contents are unchanged
						const emitOutput = emitCache.get({fileName: file, languageService});

						// Return the emit output results to Rollup
						return getSourceDescriptionFromEmitOutput(emitOutput);
				  })();

			// If nothing was emitted, simply return undefined
			if (sourceDescription == null) {
				return undefined;
			} else {
				transformedFiles.add(file);
				// If Babel shouldn't be used, simply return the emitted results
				if (babelConfig == null) {
					return sourceDescription;
				}

				// Otherwise, pass it on to Babel to perform the rest of the transpilation steps
				else {
					const transpilationResult = await transformAsync(sourceDescription.code, {
						...babelConfig(file),
						filename: file,
						filenameRelative: nativeNormalize(ensureRelative(cwd, file)),
						inputSourceMap: typeof sourceDescription.map === "string" ? JSON.parse(sourceDescription.map) : sourceDescription.map
					});

					// Return the results
					return {
						code: transpilationResult.code,
						map: transpilationResult.map == null ? undefined : transpilationResult.map
					};
				}
			}
		},

		/**
		 * Attempts to resolve the given id via the LanguageServiceHost
		 */
		resolveId(this: PluginContext, id: string, parent: string | undefined): string | null {
			// Don't proceed if there is no parent (in which case this is an entry module)
			if (parent == null) return null;

			// Handle tslib differently
			if (isTslib(id)) {
				const tslibPath = resolveCache.findHelperFromNodeModules(typescript, "tslib/tslib.es6.js", cwd);
				if (tslibPath != null) {
					return nativeNormalize(tslibPath);
				}
			}

			// Handle Babel helpers differently
			else if (isBabelHelper(id)) {
				const babelHelperPath = resolveCache.findHelperFromNodeModules(typescript, id, cwd);
				if (babelHelperPath != null) {
					return nativeNormalize(babelHelperPath);
				}
			}

			const resolveResult = resolver(id, parent);
			return resolveResult == null ? null : nativeNormalize(resolveResult.fileName);
		},

		/**
		 * Optionally loads the given id. Is used to swap out the regenerator-runtime implementation used by babel
		 * to use one that is using ESM by default to play nice with Rollup even when rollup-plugin-commonjs isn't
		 * being used
		 */
		load(this: PluginContext, id: string): string | null {
			// Return the alternative source for the regenerator runtime if that file is attempted to be loaded
			if (id.endsWith(REGENERATOR_RUNTIME_NAME_1) || id.endsWith(REGENERATOR_RUNTIME_NAME_2)) {
				return REGENERATOR_SOURCE;
			}
			return null;
		},

		/**
		 * Invoked when a full bundle is generated. Will take all modules for all chunks and make sure to remove all removed files
		 * from the LanguageService
		 */
		generateBundle(this: PluginContext, outputOptions: OutputOptions, bundle: OutputBundle): void {
			// Only emit diagnostics if the plugin options allow it
			if (!Boolean(transpileOnly)) {
				// Emit all reported diagnostics
				emitDiagnosticsThroughRollup({languageServiceHost, languageService, pluginOptions, typescript, context: this});
			}

			// Emit declaration files if required
			if (Boolean(parsedCommandLineResult.parsedCommandLine.options.declaration)) {
				emitDeclarations({
					bundle,
					fileSystem,
					pluginContext: this,
					supportedExtensions: SUPPORTED_EXTENSIONS,
					resolver: ambientResolver,
					cwd,
					outputOptions,
					pluginOptions,
					languageServiceHost,
					compilerOptions: parsedCommandLineResult.parsedCommandLine.options,
					multiEntryFileNames: MULTI_ENTRY_FILE_NAMES,
					canEmitForFile
				});
			}

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
