import {isBabelPluginTransformRuntime, isBabelPresetEnv, isYearlyBabelPreset, somePathsAreRelated} from "../path/path-util";
import {
	BABEL_MINIFICATION_BLACKLIST_PLUGIN_NAMES,
	BABEL_MINIFICATION_BLACKLIST_PRESET_NAMES,
	BABEL_MINIFY_PLUGIN_NAMES,
	BABEL_MINIFY_PRESET_NAMES,
	FORCED_BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS,
	FORCED_BABEL_PRESET_ENV_OPTIONS,
	FORCED_BABEL_YEARLY_PRESET_OPTIONS
} from "../../constant/constant";
import {ConfigItem, createConfigItem, loadOptions, loadPartialConfig, TransformOptions} from "@babel/core";
import {GetBabelConfigOptions} from "./get-babel-config-options";
import {BabelConfigFactory, FullConfig} from "./get-babel-config-result";
import {ITypescriptPluginBabelOptions} from "../../plugin/i-typescript-plugin-options";
import {isDefined} from "../is-defined/is-defined";

// tslint:disable:no-any

/**
 * Returns true if the given babelConfig is IBabelInputOptions
 */
function isBabelInputOptions(babelConfig?: ITypescriptPluginBabelOptions["babelConfig"]): babelConfig is Partial<TransformOptions> {
	return babelConfig != null && typeof babelConfig !== "string";
}

/**
 * Combines the given two sets of presets
 */
function combineConfigItems(
	userItems: ConfigItem[],
	defaultItems: ConfigItem[] = [],
	forcedItems: ConfigItem[] = [],
	inChunkPhase: boolean
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
	);
}

/**
 * Returns true if the given configItem is related to minification
 */
function configItemIsRelevantForChunkPhase(configItem: ConfigItem): boolean {
	return (
		BABEL_MINIFY_PRESET_NAMES.some(preset => configItem.file?.resolved.includes(preset)) ||
		BABEL_MINIFY_PLUGIN_NAMES.some(plugin => configItem.file?.resolved.includes(plugin))
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

/**
 * Gets a Babel Config based on the given options
 */
export function getBabelConfig({
	babelConfig,
	cwd,
	forcedOptions = {},
	defaultOptions = {},
	browserslist,
	phase,
	hook
}: GetBabelConfigOptions): BabelConfigFactory {
	return (filename: string) => {
		// Load a partial Babel config based on the input options
		const partialConfig = loadPartialConfig(
			// If babel options are provided directly
			isBabelInputOptions(babelConfig)
				? // If the given babelConfig is an object of input options, use that as the basis for the full config
				  {...babelConfig, cwd, root: cwd, configFile: false, babelrc: false}
				: // Load the path to a babel config provided to the plugin if any, otherwise try to resolve it
				  {
						cwd,
						root: cwd,
						filename
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
			options.presets = options.presets.map((preset: any) => {
				// Apply the forced @babel/preset-env options here
				if (isBabelPresetEnv(preset.file.resolved)) {
					return createConfigItem(
						[
							preset.file.request,
							{
								...(preset.options == null ? {} : preset.options),
								...FORCED_BABEL_PRESET_ENV_OPTIONS,
								// If targets have already been provided by the user options, accept them.
								// Otherwise, apply the browserslist as the preset-env target
								...(preset.options != null && preset.options.targets != null
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
					return createConfigItem(
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
			options.plugins = options.plugins.map((plugin: any) => {
				// Apply the forced @babel/preset-env options here
				if (isBabelPluginTransformRuntime(plugin.file.resolved)) {
					return createConfigItem(
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
				defaultPresets == null
					? undefined
					: (loadPartialConfig({presets: defaultPresets, ...configFileOption})?.options.presets as ConfigItem[] | null) ?? undefined,
				forcedPresets == null
					? undefined
					: (loadPartialConfig({presets: forcedPresets, ...configFileOption})?.options.presets as ConfigItem[] | null | undefined) ?? undefined,
				phase === "chunk"
			),
			plugins: combineConfigItems(
				(options.plugins ?? []) as ConfigItem[],
				defaultPlugins == null
					? undefined
					: (loadPartialConfig({plugins: defaultPlugins, ...configFileOption})?.options.plugins as ConfigItem[] | null) ?? undefined,
				forcedPlugins == null
					? undefined
					: (loadPartialConfig({plugins: forcedPlugins, ...configFileOption})?.options.plugins as ConfigItem[] | null | undefined) ?? undefined,
				phase === "chunk"
			)
		};

		// sourceMap is an alias for 'sourceMaps'. If the user provided it, make sure it is undefined. Otherwise, Babel will fail during validation
		if ("sourceMap" in (combined as {sourceMap?: {}})) {
			delete (combined as {sourceMap?: {}}).sourceMap;
		}

		const combinedOptionsAfterHook = hook != null ? hook(combined, partialConfig.config ?? partialConfig.babelrc ?? undefined, phase) : combined;

		const loadedOptions = (loadOptions({...combinedOptionsAfterHook, filename, ...configFileOption}) as FullConfig | null) ?? undefined;

		// Only return a config in the chunk phase if it includes at least one plugin or preset that is relevant to it
		if (phase === "chunk") {
			const hasRelevantConfigItems =
				loadedOptions != null &&
				[...(combined.plugins ?? []).filter(configItemIsRelevantForChunkPhase), ...(combined.presets ?? []).filter(configItemIsRelevantForChunkPhase)]
					.length > 0;
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
