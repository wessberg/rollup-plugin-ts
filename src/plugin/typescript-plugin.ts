import {InputOptions, OutputBundle, OutputOptions, Plugin, PluginContext, RenderedChunk, SourceMap, TransformSourceDescription} from "rollup";
import {createDocumentRegistry, createLanguageService, LanguageService} from "typescript";
import {getParsedCommandLine} from "../util/get-parsed-command-line/get-parsed-command-line";
import {getForcedCompilerOptions} from "../util/get-forced-compiler-options/get-forced-compiler-options";
import {IncrementalLanguageService} from "../service/language-service/incremental-language-service";
import {getSourceDescriptionFromEmitOutput} from "../util/get-source-description-from-emit-output/get-source-description-from-emit-output";
import {IEmitCache} from "../service/cache/emit-cache/i-emit-cache";
import {EmitCache} from "../service/cache/emit-cache/emit-cache";
import {emitDeclarations} from "../util/emit-declarations/emit-declarations";
import {emitDiagnosticsThroughRollup} from "../util/diagnostic/emit-diagnostics-through-rollup";
import {getSupportedExtensions} from "../util/get-supported-extensions/get-supported-extensions";
import {ensureRelative, getExtension, isBabelHelper, isRollupPluginMultiEntry, isTslib} from "../util/path/path-util";
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
import {REGENERATOR_RUNTIME_NAME_1, REGENERATOR_RUNTIME_NAME_2, ROLLUP_PLUGIN_MULTI_ENTRY} from "../constant/constant";
import {REGENERATOR_SOURCE} from "../lib/regenerator/regenerator";
import {getDefaultBabelOptions} from "../util/get-default-babel-options/get-default-babel-options";
// @ts-ignore
import {transformAsync} from "@babel/core";
// @ts-ignore
import {createFilter} from "rollup-pluginutils";
import {resolveId} from "../util/resolve-id/resolve-id";
import {mergeTransformers} from "../util/merge-transformers/merge-transformers";
import {ensureArray} from "../util/ensure-array/ensure-array";
import {isOutputChunk} from "../util/is-output-chunk/is-output-chunk";
import {getDeclarationOutDir} from "../util/get-declaration-out-dir/get-declaration-out-dir";
import {getOutDir} from "../util/get-out-dir/get-out-dir";
import {GetParsedCommandLineResult} from "../util/get-parsed-command-line/get-parsed-command-line-result";
import {takeBrowserslistOrComputeBasedOnCompilerOptions} from "../util/take-browserslist-or-compute-based-on-compiler-options/take-browserslist-or-compute-based-on-compiler-options";
import {matchAll} from "@wessberg/stringutil";
import {join} from "path";
import {Resolver} from "../util/resolve-id/resolver";
import {mergeChunksWithAmbientDependencies} from "../util/chunk/merge-chunks-with-ambient-dependencies";
import {getChunkToOriginalFileMap} from "../util/chunk/get-chunk-to-original-file-map";
import {getModuleDependencies, ModuleDependencyMap} from "../util/module/get-module-dependencies";

/**
 * The name of the Rollup plugin
 * @type {string}
 */
const PLUGIN_NAME = "Typescript";

/**
 * A Rollup plugin that transpiles the given input with Typescript
 * @param {TypescriptPluginOptions} [pluginInputOptions={}]
 */
export default function typescriptRollupPlugin(pluginInputOptions: Partial<TypescriptPluginOptions> = {}): Plugin {
	const pluginOptions: TypescriptPluginOptions = getPluginOptions(pluginInputOptions);
	const {include, exclude, tsconfig, cwd, browserslist} = pluginOptions;
	const transformers = pluginOptions.transformers == null ? [] : ensureArray(pluginOptions.transformers);
	// Make sure to normalize the received Browserslist
	const normalizedBrowserslist = getBrowserslist({browserslist, cwd, fileSystem: pluginOptions.fileSystem});

	/**
	 * The ParsedCommandLine to use with Typescript
	 * @type {GetParsedCommandLineResult?}
	 */
	let parsedCommandLineResult: GetParsedCommandLineResult;

	/**
	 * The config to use with Babel, if Babel should transpile source code
	 * @type {IBabelConfig}
	 */
	let babelConfig: ((filename: string) => IBabelConfig) | undefined;

	/**
	 * If babel is to be used, and if one or more minify presets/plugins has been passed, this config will be used
	 * @type {boolean}
	 */
	let babelMinifyConfig: ((filename: string) => IBabelConfig) | undefined;

	/**
	 * If babel is to be used, and if one or more minify presets/plugins has been passed, this will be true
	 * @type {boolean}
	 */
	let hasBabelMinifyOptions: boolean = false;

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
	 * The LanguageService to use
	 * @type {LanguageService?}
	 */
	let languageService: LanguageService;

	/**
	 * A function that given an id and a parent resolves the full path for a dependency. The Module Resolution Algorithm depends on the CompilerOptions as well
	 * as the supported extensions
	 * @type {Resolver}
	 */
	let resolver: Resolver;

	/**
	 * A function that given an id and a parent resolves the full path for a dependency, prioritizing ambient files (.d.ts). The Module Resolution Algorithm depends on the CompilerOptions as well
	 * as the supported extensions
	 * @type {Resolver}
	 */
	let ambientResolver: Resolver;

	/**
	 * The EmitCache to use
	 * @type {EmitCache}
	 */
	const emitCache: IEmitCache = new EmitCache();

	const moduleDependencyCache = new Map<string, Set<string>>();

	/**
	 * The ResolveCache to use
	 * @type {ResolveCache}
	 */
	const resolveCache: IResolveCache = new ResolveCache({fileSystem: pluginOptions.fileSystem});

	/**
	 * A Map between file names and the Set of absolute paths they depend on. Not all will be part of Rollup's chunk modules (specifically, emit-less ones won't be).
	 * This is going to be important in the declaration bundling and tree-shaking phase since this information would otherwise be lost.
	 * @type {Map<string, Set<string>>}
	 */
	const moduleDependencyMap: ModuleDependencyMap = new Map();

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
	 * @type {string[]}
	 */
	let SUPPORTED_EXTENSIONS: Set<string>;

	/**
	 * The InputOptions provided to Rollup
	 * @type {InputOptions}
	 */
	let rollupInputOptions: InputOptions;

	/**
	 * A Set of the entry filenames for when using rollup-plugin-multi-entry (we need to track this for generating valid declarations)
	 * @type {Set<string>?}
	 */
	let MULTI_ENTRY_FILE_NAMES: Set<string> | undefined;

	/**
	 * Returns true if Typescript can emit something for the given file
	 * @param {string} id
	 * @param {string[]} supportedExtensions
	 * @returns {boolean}
	 */
	let canEmitForFile: (id: string) => boolean;

	return {
		name: PLUGIN_NAME,

		/**
		 * Invoked when Input options has been received by Rollup
		 * @param {InputOptions} options
		 */
		options(options: InputOptions): undefined {
			// Break if we've already received options
			if (rollupInputOptions != null) return;

			rollupInputOptions = options;

			// Make sure we have a proper ParsedCommandLine to work with
			parsedCommandLineResult = getParsedCommandLine({
				tsconfig,
				cwd,
				forcedCompilerOptions: getForcedCompilerOptions({pluginOptions, rollupInputOptions, browserslist: normalizedBrowserslist}),
				fileSystem: pluginOptions.fileSystem
			});

			// Prepare a Babel config if Babel should be the transpiler
			if (pluginOptions.transpiler === "babel") {
				// A browserslist may already be provided, but if that is not the case, one can be computed based on the "target" from the tsconfig
				const computedBrowserslist = takeBrowserslistOrComputeBasedOnCompilerOptions(
					normalizedBrowserslist,
					parsedCommandLineResult.originalCompilerOptions
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
					supportedExtensions: SUPPORTED_EXTENSIONS
				});

			resolver = (id: string, parent: string) => {
				const resolved = resolve(id, parent);
				return resolved == null ? undefined : resolved.resolvedFileName;
			};

			ambientResolver = (id: string, parent: string) => {
				const resolved = resolve(id, parent);
				return resolved == null ? undefined : resolved.resolvedAmbientFileName != null ? resolved.resolvedAmbientFileName : resolved.resolvedFileName;
			};

			// Hook up a LanguageServiceHost and a LanguageService
			languageServiceHost = new IncrementalLanguageService({
				cwd,
				emitCache,
				resolveCache,
				rollupInputOptions,
				supportedExtensions: SUPPORTED_EXTENSIONS,
				fileSystem: pluginOptions.fileSystem,
				parsedCommandLine: parsedCommandLineResult.parsedCommandLine,
				transformers: mergeTransformers(...transformers),
				languageService: () => languageService
			});

			languageService = createLanguageService(
				languageServiceHost,
				createDocumentRegistry(languageServiceHost.useCaseSensitiveFileNames(), languageServiceHost.getCurrentDirectory())
			);

			// Hook up a new ModuleResolutionHost
			moduleResolutionHost = new ModuleResolutionHost({languageServiceHost, extensions: SUPPORTED_EXTENSIONS});

			return undefined;
		},

		/**
		 * Renders the given chunk. Will emit declaration files if the Typescript config says so.
		 * Will also apply any minification via Babel if a minification plugin or preset has been provided,
		 * and if Babel is the chosen transpiler. Otherwise, it will simply do nothing
		 * @param {string} code
		 * @param {RenderedChunk} chunk
		 * @returns {Promise<{ code: string, map: SourceMap } | null>}
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
		 * @param {string} code
		 * @param {string} file
		 * @returns {Promise<TransformSourceDescription?>}
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
							moduleDependencyCache.delete(file);
						}

						// Add the file to the LanguageServiceHost
						languageServiceHost.addFile({file, code});
						moduleDependencyMap.set(
							file,
							getModuleDependencies({
								resolver: ambientResolver,
								languageServiceHost,
								file,
								supportedExtensions: SUPPORTED_EXTENSIONS,
								cache: moduleDependencyCache
							})
						);

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
						filenameRelative: ensureRelative(cwd, file),
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
		 * @param {string} id
		 * @param {string} parent
		 * @returns {string | null}
		 */
		resolveId(this: PluginContext, id: string, parent: string | undefined): string | null {
			// Don't proceed if there is no parent (in which case this is an entry module)
			if (parent == null) return null;

			// Handle tslib differently
			if (isTslib(id)) {
				const tslibPath = resolveCache.findHelperFromNodeModules("tslib/tslib.es6.js", cwd);
				if (tslibPath != null) {
					return tslibPath;
				}
			}

			// Handle Babel helpers differently
			else if (isBabelHelper(id)) {
				const babelHelperPath = resolveCache.findHelperFromNodeModules(id, cwd);
				if (babelHelperPath != null) {
					return babelHelperPath;
				}
			}

			const resolveResult = resolver(id, parent);
			return resolveResult == null ? null : resolveResult;
		},

		/**
		 * Optionally loads the given id. Is used to swap out the regenerator-runtime implementation used by babel
		 * to use one that is using ESM by default to play nice with Rollup even when rollup-plugin-commonjs isn't
		 * being used
		 * @param {string} id
		 * @returns {string | null}
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
		 * @param {OutputOptions} outputOptions
		 * @param {OutputBundle} bundle
		 * @returns {void | Promise<void>}
		 */
		generateBundle(this: PluginContext, outputOptions: OutputOptions, bundle: OutputBundle): void {
			// Only emit diagnostics if the plugin options allow it
			if (!Boolean(pluginOptions.transpileOnly)) {
				// Emit all reported diagnostics
				emitDiagnosticsThroughRollup({languageServiceHost, languageService, context: this});
			}

			// Emit declaration files if required
			if (Boolean(parsedCommandLineResult.parsedCommandLine.options.declaration)) {
				const chunks = Object.values(bundle).filter(isOutputChunk);

				const declarationOutDir = join(cwd, getDeclarationOutDir(cwd, parsedCommandLineResult.parsedCommandLine.options, outputOptions));
				const outDir = join(cwd, getOutDir(cwd, outputOptions));
				const generateMap = Boolean(parsedCommandLineResult.parsedCommandLine.options.declarationMap);
				const mergedChunks = mergeChunksWithAmbientDependencies(chunks, moduleDependencyMap);
				const chunkToOriginalFileMap = getChunkToOriginalFileMap(outDir, mergedChunks);

				mergedChunks.forEach(chunk => {
					const rawLocalModuleNames = chunk.modules;
					const localModuleNames = rawLocalModuleNames.filter(canEmitForFile);
					const rawEntryFileName = rawLocalModuleNames.slice(-1)[0];
					let entryFileNames = [localModuleNames.slice(-1)[0]];

					// If the entry filename is equal to the ROLLUP_PLUGIN_MULTI_ENTRY constant,
					// the entry is a combination of one or more of the local module names.
					// Luckily we should know this by now after having parsed the contents in the transform hook
					if (rawEntryFileName === ROLLUP_PLUGIN_MULTI_ENTRY && MULTI_ENTRY_FILE_NAMES != null) {
						// Reassign the entry file names accordingly
						entryFileNames = [...MULTI_ENTRY_FILE_NAMES];
					}

					// Don't emit declarations when there is no compatible entry file
					if (entryFileNames.length < 1 || entryFileNames.some(entryFileName => entryFileName == null)) return;

					emitDeclarations({
						resolver: ambientResolver,
						chunk,
						generateMap,
						declarationOutDir,
						outDir,
						cwd,
						outputOptions,
						pluginOptions,
						languageService,
						languageServiceHost,
						emitCache,
						chunkToOriginalFileMap,
						localModuleNames,
						entryFileNames,
						pluginContext: this,
						supportedExtensions: SUPPORTED_EXTENSIONS,
						fileSystem: pluginOptions.fileSystem
					});
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
