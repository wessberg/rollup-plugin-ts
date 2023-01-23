import type {ConfigItem, PluginObj, TransformOptions} from "@babel/core";
import {
	BABEL_MINIFICATION_BLACKLIST_PLUGIN_NAMES,
	BABEL_MINIFICATION_BLACKLIST_PRESET_NAMES,
	BABEL_MINIFY_PLUGIN_NAMES,
	BABEL_MINIFY_PRESET_NAMES,
	FORCED_BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS,
	FORCED_BABEL_PRESET_ENV_OPTIONS,
	FORCED_BABEL_YEARLY_PRESET_OPTIONS,
	BABEL_REQUIRE_RUNTIME_HELPER_ESM_REGEXP_1,
	BABEL_REQUIRE_RUNTIME_HELPER_ESM_REGEXP_2,
	BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_1,
	BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_2,
	BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_3,
	BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_4
} from "../constant/constant.js";
import type {BabelConfigHook, TranspilationPhase, TranspilerOptions, TypescriptPluginOptions} from "../plugin/typescript-plugin-options.js";
import type {Babel, BabelConfig} from "../type/babel.js";
import {isDefined} from "../util/is-defined/is-defined.js";
import {
	isBabelPluginTransformRuntime,
	isBabelPresetEnv,
	isBabelPresetTypescript,
	isYearlyBabelPreset,
	removeSearchPathFromFilename,
	resolveModule,
	somePathsAreRelated
} from "../util/path/path-util.js";
import type {SourceMap} from "rollup";
import MagicString from "magic-string";
import {matchAll} from "@wessberg/stringutil";

export interface GetForcedBabelOptionsOptions {
	cwd: string;
}

/**
 * Retrieves the Babel config options that will be forced
 */
export function getForcedBabelOptions({cwd}: GetForcedBabelOptionsOptions): TransformOptions {
	return {
		// Always use the cwd provided to the plugin
		cwd,
		// Always produce sourcemaps. Rollup will be the decider of what to do with them.
		sourceMaps: true,

		// Never let Babel be the decider of which files to ignore. Rather let Rollup decide that
		ignore: undefined,
		// Never let Babel be the decider of which files to include. Rather let Rollup decide that
		only: undefined,
		// Always parse things as modules. Rollup will then decide what to do based on the output format
		sourceType: "module",
		plugins: [
			// Needed to make babel understand dynamic imports
			resolveModule("@babel/plugin-syntax-dynamic-import")
		]
	};
}

export interface GetDefaultBabelOptionsOptions {
	browserslist?: string[];
	transpilerOptions: TranspilerOptions;
}

/**
 * Retrieves the Babel config options that will be used by default. If the user provides the same keys/presets/plugins, *they*
 * will take precedence
 */
export function getDefaultBabelOptions({browserslist, transpilerOptions}: GetDefaultBabelOptionsOptions): TransformOptions {
	const includePresetEnv = browserslist != null;
	const includePresetTypescript = transpilerOptions.typescriptSyntax === "babel";

	return {
		presets: [
			// Use @babel/preset-typescript when Babel is responsible for transforming TypeScript specific syntax
			...(!includePresetEnv
				? []
				: [
						[
							resolveModule("@babel/preset-env"),
							{
								...FORCED_BABEL_PRESET_ENV_OPTIONS,
								// Loose breaks things such as spreading an iterable that isn't an array
								loose: false,
								spec: false,
								debug: false,
								ignoreBrowserslistConfig: false,
								shippedProposals: true,
								targets: {
									browsers: browserslist
								}
							}
						]
				  ]),
			// Use @babel/preset-env when a Browserslist has been given
			...(!includePresetTypescript
				? []
				: [
						[
							resolveModule("@babel/preset-typescript"),
							{
								// There are no default options here
							}
						]
				  ])
		],
		plugins: [
			// If preset-env will be included, shipped proposals will be included already. If not, apply them here
			...(includePresetEnv
				? []
				: [
						resolveModule("@babel/plugin-proposal-object-rest-spread"),
						resolveModule("@babel/plugin-proposal-async-generator-functions"),
						resolveModule("@babel/plugin-proposal-optional-catch-binding"),
						resolveModule("@babel/plugin-proposal-unicode-property-regex"),
						resolveModule("@babel/plugin-proposal-json-strings")
				  ]),
			// Force the use of helpers (e.g. the runtime). But *don't* apply polyfills.
			[
				resolveModule("@babel/plugin-transform-runtime"),
				{
					...FORCED_BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS,
					corejs: false
				}
			]
		]
	};
}

export interface GetBabelConfigOptions {
	babel: typeof Babel;
	cwd: string;
	hook: BabelConfigHook | undefined;
	babelConfig: TypescriptPluginOptions["babelConfig"];
	browserslist: string[] | undefined;
	forcedOptions: TransformOptions | undefined;
	defaultOptions: TransformOptions | undefined;
	phase: TranspilationPhase;
}

export interface PluginObject<S = unknown> extends PluginObj<S> {
	key: string;
}

export interface FullConfig {
	cwd: string;
	root: string;
	filename: string | undefined;
	babelrc: false;
	configFile: false;
	envName: string;
	sourceMaps: boolean;
	sourceType: TransformOptions["sourceType"];
	passPerPreset: boolean;
	plugins: PluginObject[];
	presets: PluginObject[];
}

export interface GetBabelConfigResult {
	config: FullConfig | undefined;
}

export type BabelConfigFactory = (filename: string, inTypescriptStep?: boolean) => Promise<GetBabelConfigResult>;

/**
 * Gets a Babel Config based on the given options
 */
export function getBabelConfig({babel, babelConfig, cwd, forcedOptions = {}, defaultOptions = {}, browserslist, phase, hook}: GetBabelConfigOptions): BabelConfigFactory {
	return async (filename: string, inTypescriptStep = false) => {
		// Load a partial Babel config based on the input options
		const partialConfig = await babel.loadPartialConfigAsync(
			// If babel options are provided directly
			isBabelConfig(babelConfig) && Object.keys(babelConfig).length > 0
				? // If the given babelConfig is an object of input options, use that as the basis for the full config
				  {cwd, root: cwd, ...babelConfig}
				: // Load the path to a babel config provided to the plugin if any, otherwise try to resolve it
				  {
						cwd,
						root: cwd,
						filename: removeSearchPathFromFilename(filename),
						...(babelConfig == null || typeof babelConfig !== "string" ? {} : {configFile: babelConfig})
				  }
		);

		if (partialConfig == null) {
			return {
				config: undefined
			};
		}

		const {options} = partialConfig;
		const {presets: forcedPresets, plugins: forcedPlugins, ...otherForcedOptions} = forcedOptions;
		const {presets: defaultPresets, plugins: defaultPlugins, ...otherDefaultOptions} = defaultOptions;

		const configFileOption: TransformOptions = {configFile: false, babelrc: false};

		// If users have provided presets of their own, ensure that they are using respecting the forced options
		if (options.presets != null) {
			options.presets = (options.presets as ConfigItem[]).map(preset => {
				if (preset.file == null) return preset;

				// Apply the forced @babel/preset-env options here
				if (isBabelPresetEnv(preset.file.resolved)) {
					return babel.createConfigItem(
						[
							preset.file.request,
							{
								...(preset.options == null ? {} : preset.options),
								...FORCED_BABEL_PRESET_ENV_OPTIONS,
								// If targets have already been provided by the user options, accept them.
								// Otherwise, apply the browserslist as the preset-env target
								...(preset.options != null && (preset.options as {targets?: unknown}).targets != null
									? {}
									: {
											targets: {
												browsers: browserslist
											}
									  })
							}
						],
						{type: "preset", dirname: cwd}
					);
				}

				// Apply the forced @babel/preset-es[2015|2016|2017...] options here
				else if (isYearlyBabelPreset(preset.file.resolved)) {
					return babel.createConfigItem(
						[
							preset.file.request,
							{
								...(preset.options == null ? {} : preset.options),
								...FORCED_BABEL_YEARLY_PRESET_OPTIONS
							}
						],
						{type: "preset", dirname: cwd}
					);
				}

				return preset;
			});
		}

		// If users have provided plugins of their own, ensure that they are using respecting the forced options
		if (options.plugins != null) {
			options.plugins = (options.plugins as ConfigItem[]).map((plugin: ConfigItem) => {
				if (plugin.file == null) return plugin;

				if (isBabelPluginTransformRuntime(plugin.file.resolved)) {
					return babel.createConfigItem(
						[
							plugin.file.request,
							{
								...(plugin.options == null ? {} : plugin.options),
								...FORCED_BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS
							}
						],
						{type: "plugin", dirname: cwd}
					);
				}

				return plugin;
			});
		}

		// Combine the partial config with the default and forced options
		const combined: TransformOptions = {
			...otherDefaultOptions,
			...options,
			...otherForcedOptions,
			presets: combineConfigItems(
				(options.presets ?? []) as ConfigItem[],
				defaultPresets == null ? undefined : (babel.loadPartialConfig({presets: defaultPresets, ...configFileOption})?.options.presets as ConfigItem[] | null) ?? undefined,
				forcedPresets == null
					? undefined
					: (babel.loadPartialConfig({presets: forcedPresets, ...configFileOption})?.options.presets as ConfigItem[] | null | undefined) ?? undefined,
				phase === "chunk",
				inTypescriptStep
			),
			plugins: combineConfigItems(
				(options.plugins ?? []) as ConfigItem[],
				defaultPlugins == null ? undefined : (babel.loadPartialConfig({plugins: defaultPlugins, ...configFileOption})?.options.plugins as ConfigItem[] | null) ?? undefined,
				forcedPlugins == null
					? undefined
					: (babel.loadPartialConfig({plugins: forcedPlugins, ...configFileOption})?.options.plugins as ConfigItem[] | null | undefined) ?? undefined,
				phase === "chunk",
				inTypescriptStep
			)
		};

		// sourceMap is an alias for 'sourceMaps'. If the user provided it, make sure it is undefined. Otherwise, Babel will fail during validation
		if ("sourceMap" in (combined as {sourceMap?: unknown})) {
			delete (combined as {sourceMap?: unknown}).sourceMap;
		}

		const combinedOptionsAfterHook = hook != null ? hook(combined, partialConfig.config ?? partialConfig.babelrc ?? undefined, phase) : combined;

		const loadedOptions = (babel.loadOptions({...combinedOptionsAfterHook, filename, ...configFileOption}) as FullConfig | null) ?? undefined;

		// Only return a config in the chunk phase if it includes at least one plugin or preset that is relevant to it
		if (phase === "chunk") {
			const hasRelevantConfigItems =
				loadedOptions != null &&
				[
					...((combined.plugins as ConfigItem[]) ?? []).filter(configItemIsRelevantForChunkPhase),
					...((combined.presets as ConfigItem[]) ?? []).filter(configItemIsRelevantForChunkPhase)
				].length > 0;
			return {
				config: hasRelevantConfigItems ? loadedOptions : undefined
			};
		} else {
			return {
				config: loadedOptions
			};
		}
	};
}

function isBabelConfig(babelConfig?: TypescriptPluginOptions["babelConfig"]): babelConfig is Partial<BabelConfig> {
	return babelConfig != null && typeof babelConfig !== "string";
}

/**
 * Combines the given two sets of presets
 */
function combineConfigItems(
	userItems: ConfigItem[],
	defaultItems: ConfigItem[] = [],
	forcedItems: ConfigItem[] = [],
	inChunkPhase: boolean,
	inTypescriptStep: boolean
): ConfigItem[] {
	const namesInUserItems = new Set(userItems.map(item => item.file?.resolved).filter(isDefined));
	const namesInForcedItems = new Set(forcedItems.map(item => item.file?.resolved).filter(isDefined));
	const userItemsHasYearlyPreset = [...namesInUserItems].some(isYearlyBabelPreset);

	return (
		[
			// Only use those default items that doesn't appear within the forced items or the user-provided items.
			// If the options contains a yearly preset such as "preset-es2015", filter out preset-env from the default items if it is given
			...defaultItems.filter(
				item =>
					item.file == null ||
					(!somePathsAreRelated(namesInUserItems, item.file.resolved) &&
						!somePathsAreRelated(namesInForcedItems, item.file.resolved) &&
						(!userItemsHasYearlyPreset || !isBabelPresetEnv(item.file.resolved)))
			),

			// Only use those user items that doesn't appear within the forced items
			...userItems.filter(item => item.file == null || !namesInForcedItems.has(item.file.resolved)),

			// Apply the forced items at all times
			...forcedItems
		]
			// Filter out those options that do not apply depending on whether or not to apply minification
			.filter(configItem => (inChunkPhase ? configItemIsAllowedDuringChunkPhase(configItem) : configItemIsAllowedDuringFilePhase(configItem)))

			// Only allow @babel/preset-typescript if we're actually in the initial TypeScript phase
			.filter(configItem => configItem.file?.resolved == null || !isBabelPresetTypescript(configItem.file?.resolved) || inTypescriptStep)
	);
}

/**
 * Returns true if the given configItem is related to minification
 */
function configItemIsRelevantForChunkPhase(configItem: ConfigItem): boolean {
	return (
		BABEL_MINIFY_PRESET_NAMES.some(preset => configItem.file?.resolved.includes(preset)) || BABEL_MINIFY_PLUGIN_NAMES.some(plugin => configItem.file?.resolved.includes(plugin))
	);
}

/**
 * Returns true if the given configItem is allowed per chunk transformation
 */
function configItemIsAllowedDuringChunkPhase(configItem: ConfigItem): boolean {
	return (
		BABEL_MINIFICATION_BLACKLIST_PRESET_NAMES.every(preset => configItem.file == null || !configItem.file.resolved.includes(preset)) &&
		BABEL_MINIFICATION_BLACKLIST_PLUGIN_NAMES.every(plugin => configItem.file == null || !configItem.file.resolved.includes(plugin))
	);
}

/**
 * Returns true if the given configItem is allowed per file transformations
 */
function configItemIsAllowedDuringFilePhase(configItem: ConfigItem): boolean {
	return (
		BABEL_MINIFY_PRESET_NAMES.every(preset => configItem.file == null || !configItem.file.resolved.includes(preset)) &&
		BABEL_MINIFY_PLUGIN_NAMES.every(plugin => configItem.file == null || !configItem.file.resolved.includes(plugin))
	);
}

export function replaceBabelHelpers(code: string, filename: string, target: "cjs" | "esm"): {code: string; map: SourceMap} | undefined {
	const matches =
		target === "cjs"
			? [...matchAll(code, BABEL_REQUIRE_RUNTIME_HELPER_ESM_REGEXP_1), ...matchAll(code, BABEL_REQUIRE_RUNTIME_HELPER_ESM_REGEXP_2)]
			: [
					...matchAll(code, BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_1),
					...matchAll(code, BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_2),
					...matchAll(code, BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_3),
					...matchAll(code, BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_4)
			  ];

	if (matches.length < 1) return undefined;

	const magicString = new MagicString(code, {filename, indentExclusionRanges: []});
	for (const match of matches) {
		const start = match.index + match[1].length;
		const end = match.index + match[1].length + match[2].length;

		if (target === "cjs") {
			magicString.overwrite(start, end, match[2].replace(`/esm/`, `/`));
		} else {
			magicString.overwrite(start, end, match[2].replace(/\/helpers\/(?!esm)/g, `/helpers/esm/`));
		}
	}
	return {
		code: magicString.toString(),
		map: magicString.generateMap({hires: true, source: filename, includeContent: true})
	};
}
