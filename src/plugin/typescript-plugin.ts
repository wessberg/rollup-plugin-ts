import {ExistingRawSourceMap, InputOptions, OutputBundle, OutputOptions, Plugin, PluginContext, RenderedChunk, SourceDescription} from "rollup";
import {getParsedCommandLine} from "../util/get-parsed-command-line/get-parsed-command-line";
import {getForcedCompilerOptions} from "../util/get-forced-compiler-options/get-forced-compiler-options";
import {getSourceDescriptionFromEmitOutput} from "../util/get-source-description-from-emit-output/get-source-description-from-emit-output";
import {emitDiagnostics} from "../service/emit/diagnostics/emit-diagnostics";
import {getSupportedExtensions} from "../util/get-supported-extensions/get-supported-extensions";
import {ensureRelative, getExtension, isBabelHelper, isMultiEntryModule, isRegeneratorRuntime, isSwcHelper} from "../util/path/path-util";
import {takeBundledFilesNames} from "../util/take-bundled-filenames/take-bundled-filenames";
import {TypescriptPluginOptions} from "./typescript-plugin-options";
import {getPluginOptions} from "../util/plugin-options/get-plugin-options";
import {getBrowserslist} from "../util/get-browserslist/get-browserslist";
import {ResolveCache} from "../service/cache/resolve-cache/resolve-cache";
import {JSON_EXTENSION, REGENERATOR_RUNTIME_VIRTUAL_SRC, ROLLUP_PLUGIN_VIRTUAL_PREFIX} from "../constant/constant";
import {REGENERATOR_SOURCE} from "../lib/regenerator/regenerator";
import {createFilter} from "@rollup/pluginutils";
import {mergeTransformers} from "../util/merge-transformers/merge-transformers";
import {ensureArray} from "../util/ensure-array/ensure-array";
import {ParsedCommandLineResult} from "../util/get-parsed-command-line/parsed-command-line-result";
import {takeBrowserslistOrComputeBasedOnCompilerOptions} from "../util/take-browserslist-or-compute-based-on-compiler-options/take-browserslist-or-compute-based-on-compiler-options";
import {matchAll} from "@wessberg/stringutil";
import {emitDeclarations} from "../service/emit/declaration/emit-declarations";
import {CompilerHost} from "../service/compiler-host/compiler-host";
import {pickResolvedModule} from "../util/pick-resolved-module";
import {emitBuildInfo} from "../service/emit/tsbuildinfo/emit-build-info";
import {shouldDebugEmit} from "../util/is-debug/should-debug";
import {logEmit} from "../util/logging/log-emit";
import {isJsonLike} from "../util/is-json-like/is-json-like";
import path from "crosspath";
import {loadBabel, loadSwc} from "../util/transpiler-loader";
import {BabelConfigFactory, getBabelConfig, getDefaultBabelOptions, getForcedBabelOptions, replaceBabelHelpers} from "../transpiler/babel";
import {getSwcConfigFactory, SwcConfigFactory} from "../transpiler/swc";

/**
 * The name of the Rollup plugin
 */
const PLUGIN_NAME = "Typescript";

/**
 * A Rollup plugin that transpiles the given input with Typescript
 */
export default function typescriptRollupPlugin(pluginInputOptions: Partial<TypescriptPluginOptions> = {}): Plugin {
	const pluginOptions: TypescriptPluginOptions = getPluginOptions(pluginInputOptions);
	const {include, exclude, tsconfig, cwd, browserslist, typescript, fileSystem, transpileOnly} = pluginOptions;
	const transformers = pluginOptions.transformers == null ? [] : ensureArray(pluginOptions.transformers);

	// Make sure to normalize the received Browserslist
	const normalizedBrowserslist = getBrowserslist({browserslist, cwd, fileSystem});

	/**
	 * The ParsedCommandLine to use with Typescript
	 */
	let parsedCommandLineResult: ParsedCommandLineResult;

	/**
	 * The config to use with Babel for each file, if Babel should transpile source code
	 */
	let babelConfigFileFactory: BabelConfigFactory | undefined;

	/**
	 * The config to use with Babel for each chunk, if Babel should transpile source code
	 */
	let babelConfigChunkFactory: BabelConfigFactory | undefined;

	/**
	 * The config to use with swc for each file, if swc should transpile source code
	 */
	let swcConfigFileFactory: SwcConfigFactory | undefined;

	/**
	 * The config to use with swc for each chunk, if swc should transpile source code
	 */
	let swcConfigChunkFactory: SwcConfigFactory | undefined;

	/**
	 * The CompilerHost to use
	 */
	let host: CompilerHost;

	/**
	 * The ResolveCache to use
	 */
	const resolveCache = new ResolveCache({fileSystem});

	/**
	 * The filter function to use
	 */
	const internalFilter = createFilter(include, exclude);
	const filter = (id: string): boolean => !isSwcHelper(id) && (internalFilter(id) || internalFilter(path.normalize(id)) || internalFilter(path.native.normalize(id)));

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
	 * The virtual module name generated when using @rollup/plugin-multi-entry in combination with this plugin
	 */
	let MULTI_ENTRY_MODULE: string | undefined;

	const addAndEmitFile = (fileName: string, text: string, dependencyCb: (dependency: string) => void): SourceDescription | undefined => {
		// Add the file to the CompilerHost
		host.add({fileName, text, fromRollup: true});

		// Add all dependencies of the file to the File Watcher if missing
		const dependencies = host.getDependenciesForFile(fileName, true);

		if (dependencies != null) {
			for (const dependency of dependencies) {
				const pickedDependency = pickResolvedModule(dependency, false);
				if (pickedDependency == null) continue;
				dependencyCb(pickedDependency);
			}
		}

		// Get some EmitOutput, optionally from the cache if the file contents are unchanged
		const emitOutput = host.emit(fileName, false);

		// Return the emit output results to Rollup
		return getSourceDescriptionFromEmitOutput(emitOutput);
	};

	return {
		name: PLUGIN_NAME,

		/**
		 * Invoked when Input options has been received by Rollup
		 */
		async options(options: InputOptions): Promise<undefined> {
			// Break if the options aren't different from the previous ones
			if (rollupInputOptions != null) return;

			// Re-assign the input options
			rollupInputOptions = options;

			const multiEntryPlugin = options.plugins?.find(plugin => plugin != null && typeof plugin !== "boolean" && plugin.name === "multi-entry");

			// If the multi-entry plugin is being used, we can extract the name of the entry module
			// based on it
			if (multiEntryPlugin != null) {
				if (typeof options.input === "string") {
					MULTI_ENTRY_MODULE = `${ROLLUP_PLUGIN_VIRTUAL_PREFIX}${options.input}`;
				}
			}

			// Make sure we have a proper ParsedCommandLine to work with
			parsedCommandLineResult = getParsedCommandLine({
				tsconfig,
				cwd,
				fileSystem,
				typescript,
				pluginOptions,
				filter,
				forcedCompilerOptions: getForcedCompilerOptions({pluginOptions, rollupInputOptions, browserslist: normalizedBrowserslist})
			});

			switch (pluginOptions.transpiler) {
				case "babel": {
					// Prepare a Babel config if Babel should be the transpiler
					// A browserslist may already be provided, but if that is not the case, one can be computed based on the "target" from the tsconfig
					const computedBrowserslist = takeBrowserslistOrComputeBasedOnCompilerOptions(normalizedBrowserslist, parsedCommandLineResult.originalCompilerOptions, typescript);

					const sharedBabelConfigFactoryOptions = {
						babel: await loadBabel(),
						cwd,
						hook: pluginOptions.hook.babelConfig,
						babelConfig: pluginOptions.babelConfig,
						forcedOptions: getForcedBabelOptions({cwd}),
						defaultOptions: getDefaultBabelOptions({browserslist: computedBrowserslist}),
						browserslist: computedBrowserslist,
						rollupInputOptions
					};

					babelConfigFileFactory = getBabelConfig({
						...sharedBabelConfigFactoryOptions,
						phase: "file"
					});

					babelConfigChunkFactory = getBabelConfig({
						...sharedBabelConfigFactoryOptions,
						phase: "chunk"
					});
					break;
				}

				case "swc": {
					const sharedSwcConfigFactoryOptions = {
						cwd,
						fileSystem,
						typescript,
						hook: pluginOptions.hook.swcConfig,
						swcConfig: pluginOptions.swcConfig,
						browserslist: normalizedBrowserslist === false ? undefined : normalizedBrowserslist,
						ecmaVersion: parsedCommandLineResult.originalCompilerOptions.target
					};

					swcConfigFileFactory = getSwcConfigFactory({
						...sharedSwcConfigFactoryOptions,
						phase: "file"
					});

					swcConfigChunkFactory = getSwcConfigFactory({
						...sharedSwcConfigFactoryOptions,
						phase: "chunk"
					});
					break;
				}
			}

			SUPPORTED_EXTENSIONS = getSupportedExtensions(
				Boolean(parsedCommandLineResult.parsedCommandLine.options.allowJs),
				Boolean(parsedCommandLineResult.parsedCommandLine.options.resolveJsonModule)
			);

			// Hook up a CompilerHost
			host = new CompilerHost({
				filter,
				cwd,
				resolveCache,
				fileSystem,
				typescript,
				extensions: SUPPORTED_EXTENSIONS,
				externalOption: rollupInputOptions.external,
				parsedCommandLineResult,
				transformers: mergeTransformers(...transformers)
			});

			return undefined;
		},

		/**
		 * Renders the given chunk. Will emit declaration files if the Typescript config says so.
		 * Will also apply any minification via Babel if a minification plugin or preset has been provided,
		 * and if Babel is the chosen transpiler. Otherwise, it will simply do nothing
		 */
		async renderChunk(this: PluginContext, code: string, chunk: RenderedChunk, outputOptions: OutputOptions): Promise<SourceDescription | null> {
			let updatedSourceDescription: SourceDescription | undefined;

			switch (pluginOptions.transpiler) {
				case "babel": {
					const {config} = babelConfigChunkFactory!(chunk.fileName);
					const babel = await loadBabel();

					// When targeting CommonJS and using babel as a transpiler, we may need to rewrite forced ESM paths for preserved external helpers to paths that are compatible with CommonJS.
					updatedSourceDescription = replaceBabelHelpers(code, chunk.fileName, outputOptions.format === "cjs" || outputOptions.format === "commonjs" ? "cjs" : "esm");

					// Don't proceed if there is no minification config
					if (config == null) {
						return updatedSourceDescription ?? null;
					}

					const updatedCode = updatedSourceDescription != null ? updatedSourceDescription.code : code;
					const updatedMap = updatedSourceDescription != null ? (updatedSourceDescription.map as ExistingRawSourceMap) : undefined;

					const transpilationResult = await babel.transformAsync(updatedCode, {
						...config,
						filenameRelative: ensureRelative(cwd, chunk.fileName),
						...(updatedMap == null
							? {}
							: {
									inputSourceMap: {...updatedMap, file: updatedMap.file ?? ""}
							  })
					});

					if (transpilationResult == null || transpilationResult.code == null) {
						return updatedSourceDescription == null ? null : updatedSourceDescription;
					}

					// Return the results
					return {
						code: transpilationResult.code,
						map: transpilationResult.map ?? undefined
					};
				}

				case "swc": {
					const config = swcConfigChunkFactory!(chunk.fileName);
					const swc = await loadSwc();

					// Don't proceed if there is no minification config
					if (config == null) {
						return updatedSourceDescription ?? null;
					}

					const updatedCode = updatedSourceDescription != null ? updatedSourceDescription.code : code;
					const updatedMap = updatedSourceDescription != null ? (updatedSourceDescription.map as ExistingRawSourceMap) : undefined;

					const transpilationResult = await swc.transform(updatedCode, {
						...config,
						...(updatedMap == null
							? {}
							: {
									inputSourceMap: JSON.stringify(updatedMap)
							  })
					});

					if (transpilationResult == null || transpilationResult.code == null) {
						return updatedSourceDescription == null ? null : updatedSourceDescription;
					}

					// Return the results
					return {
						code: transpilationResult.code,
						map: transpilationResult.map ?? undefined
					};
				}

				default: {
					return updatedSourceDescription ?? null;
				}
			}
		},

		/**
		 * When a file changes, make sure to clear it from any caches to avoid stale caches
		 */
		watchChange(id: string): void {
			host.delete(id);
			resolveCache.delete(id);
			host.clearCaches();
		},

		/**
		 * Transforms the given code and file
		 */
		async transform(this: PluginContext, code: string, file: string): Promise<SourceDescription | undefined> {
			const normalizedFile = path.normalize(file);

			// If this file represents ROLLUP_PLUGIN_MULTI_ENTRY, we need to parse its' contents to understand which files it aliases.
			// Following that, there's nothing more to do
			if (isMultiEntryModule(normalizedFile, MULTI_ENTRY_MODULE)) {
				MULTI_ENTRY_FILE_NAMES = new Set(matchAll(code, /(import|export)\s*(\*\s*from\s*)?["'`]([^"'`]*)["'`]/).map(([, , , p]) => path.normalize(p.replace(/\\\\/g, "\\"))));
				return undefined;
			}

			// Skip the file if it doesn't match the filter or if the helper cannot be transformed
			if (!filter(normalizedFile)) {
				return undefined;
			}

			const hasJsonExtension = getExtension(normalizedFile) === JSON_EXTENSION;

			// Files with a .json extension may not necessarily be JSON, for example
			// if a JSON plugin came before rollup-plugin-ts, in which case it shouldn't be treated
			// as JSON.
			const isJsInDisguise = hasJsonExtension && !isJsonLike(code);

			switch (pluginOptions.transpiler) {
				case "babel": {
					const babel = await loadBabel();
					const babelConfigResult = babelConfigFileFactory!(file);
					let sourceDescription: SourceDescription = {code, map: undefined};

					// Some @babel/runtime helpers may depend on other helpers, but sometimes these are imported from the incorrect paths.
					// For example, some @babel/runtime/helpers/esm files depend on CJS helpers where they actually should depend on esm helpers instead.
					// In these cases, we'll have to transform the imports immediately since it will otherwise break for users who don't use something like the commonjs plugin,
					// even though this is technically not a problem directly caused by or related to rollup-plugin-ts
					if (isBabelHelper(normalizedFile)) {
						sourceDescription = replaceBabelHelpers(code, normalizedFile, "esm") ?? sourceDescription;
					}

					// Only pass the file through Typescript if it's extension is supported.
					// Otherwise, return whatever transformations that may have been applied to the source description already
					if (host.isSupportedFileName(normalizedFile) && !isJsInDisguise) {
						sourceDescription = addAndEmitFile(normalizedFile, sourceDescription.code, dependency => this.addWatchFile(dependency)) ?? sourceDescription;
					}

					const transpilationResult = await babel.transformAsync(sourceDescription.code, {
						...babelConfigResult.config,
						filenameRelative: ensureRelative(cwd, normalizedFile),
						inputSourceMap: typeof sourceDescription.map === "string" ? JSON.parse(sourceDescription.map) : sourceDescription.map
					});

					if (transpilationResult == null || transpilationResult.code == null) {
						return sourceDescription;
					}

					// Return the results
					return {
						code: transpilationResult.code,
						map: transpilationResult.map ?? undefined
					};
				}

				case "swc": {
					const swc = await loadSwc();
					const swcConfigResult = swcConfigFileFactory!(file);
					let sourceDescription: SourceDescription = {code, map: undefined};

					// Only pass the file through Typescript if it's extension is supported.
					// Otherwise, return whatever transformations that may have been applied to the source description already
					if (host.isSupportedFileName(normalizedFile) && !isJsInDisguise) {
						sourceDescription = addAndEmitFile(normalizedFile, sourceDescription.code, dependency => this.addWatchFile(dependency)) ?? sourceDescription;
					}

					const transpilationResult = await swc.transform(sourceDescription.code, {
						...swcConfigResult,
						inputSourceMap: typeof sourceDescription.map === "string" ? sourceDescription.map : JSON.stringify(sourceDescription.map)
					});

					if (transpilationResult == null || transpilationResult.code == null) {
						return sourceDescription;
					}

					// Return the results
					return {
						code: transpilationResult.code,
						map: transpilationResult.map ?? undefined
					};
				}

				// TypeScript
				default: {
					// Only pass the file through Typescript if it's extension is supported.
					// Otherwise, return whatever transformations that may have been applied to the source description already
					return !host.isSupportedFileName(normalizedFile) || isJsInDisguise ? undefined : addAndEmitFile(normalizedFile, code, dependency => this.addWatchFile(dependency));
				}
			}
		},

		/**
		 * Attempts to resolve the given id via the LanguageServiceHost
		 */
		resolveId(this: PluginContext, id: string, parent: string | undefined): string | null {
			// Don't proceed if there is no parent (in which case this is an entry module)
			if (parent == null) return null;

			if (id === "regenerator-runtime") {
				return REGENERATOR_RUNTIME_VIRTUAL_SRC;
			}

			const resolveResult = host.resolve(id, parent);

			const pickedResolveResult = resolveResult == null ? undefined : pickResolvedModule(resolveResult, false);
			return pickedResolveResult == null ? null : path.native.normalize(pickedResolveResult);
		},

		/**
		 * Optionally loads the given id. Is used to swap out the regenerator-runtime implementation used by babel
		 * to use one that is using ESM by default to play nice with Rollup even when rollup-plugin-commonjs isn't
		 * being used
		 */
		load(this: PluginContext, id: string): string | null {
			// Return the alternative source for the regenerator runtime if that file is attempted to be loaded
			if (isRegeneratorRuntime(path.normalize(id))) {
				return REGENERATOR_SOURCE;
			}
			return null;
		},

		/**
		 * Invoked when a full bundle is generated. Will take all modules for all chunks and make sure to remove all removed files
		 * from the LanguageService
		 */
		generateBundle(this: PluginContext, outputOptions: OutputOptions, bundle: OutputBundle): void {
			// If debugging is active, log the outputted files
			for (const file of Object.values(bundle)) {
				if (!("fileName" in file)) continue;

				const normalizedFileName = path.normalize(file.fileName);
				const text = "code" in file ? file.code : file.source.toString();
				if (shouldDebugEmit(pluginOptions.debug, normalizedFileName, text, "javascript")) {
					logEmit(normalizedFileName, text);
				}
			}

			// Only emit diagnostics if the plugin options allow it
			if (!Boolean(transpileOnly)) {
				// Emit all reported diagnostics
				emitDiagnostics({host, pluginOptions, context: this});
			}

			// Emit tsbuildinfo files if required
			if (Boolean(parsedCommandLineResult.parsedCommandLine.options.incremental) || Boolean(parsedCommandLineResult.parsedCommandLine.options.composite)) {
				emitBuildInfo({
					host,
					outputOptions,
					pluginOptions,
					pluginContext: this
				});
			}

			// Emit declaration files if required
			if (Boolean(parsedCommandLineResult.originalCompilerOptions.declaration)) {
				emitDeclarations({
					host,
					bundle,
					externalOption: rollupInputOptions.external,
					outputOptions,
					pluginOptions,
					pluginContext: this,
					multiEntryFileNames: MULTI_ENTRY_FILE_NAMES,
					multiEntryModule: MULTI_ENTRY_MODULE,
					originalCompilerOptions: parsedCommandLineResult.originalCompilerOptions
				});
			}

			const bundledFilenames = takeBundledFilesNames(bundle);

			// Walk through all of the files of the LanguageService and make sure to remove them if they are not part of the bundle
			for (const fileName of host.getRollupFileNames()) {
				if (!bundledFilenames.has(fileName)) {
					host.delete(fileName);
				}
			}
		}
	};
}
