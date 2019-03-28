import {IBabelConfigItem, IBabelInputOptions} from "../../plugin/i-babel-options";
import {IGetBabelConfigOptions} from "./i-get-babel-config-options";
import {ensureAbsolute, isBabelPluginTransformRuntime, isBabelPresetEnv, isYearlyBabelPreset} from "../path/path-util";
import {IGetBabelConfigResult} from "./i-get-babel-config-result";
import {
	BABEL_MINIFICATION_BLACKLIST_PLUGIN_NAMES,
	BABEL_MINIFICATION_BLACKLIST_PRESET_NAMES,
	BABEL_MINIFY_PLUGIN_NAMES,
	BABEL_MINIFY_PRESET_NAMES,
	FORCED_BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS,
	FORCED_BABEL_PRESET_ENV_OPTIONS,
	FORCED_BABEL_YEARLY_PRESET_OPTIONS
} from "../../constant/constant";
// @ts-ignore
import {createConfigItem, loadOptions, loadPartialConfig} from "@babel/core";

// tslint:disable:no-any

/**
 * Returns true if the given babelConfig is IBabelInputOptions
 * @param {IGetBabelConfigOptions["babelConfig"]} babelConfig
 * @returns {babelConfig is IBabelInputOptions}
 */
export function isBabelInputOptions(babelConfig?: IGetBabelConfigOptions["babelConfig"]): babelConfig is Partial<IBabelInputOptions> {
	return babelConfig != null && typeof babelConfig !== "string";
}

/**
 * Combines the given two sets of presets
 * @param {IBabelConfigItem[]} userItems
 * @param {IBabelConfigItem[]} defaultItems
 * @param {object[]} [forcedItems]
 * @param {boolean} [useMinifyOptions]
 * @returns {{}[]}
 */
function combineConfigItems(userItems: IBabelConfigItem[], defaultItems: IBabelConfigItem[] = [], forcedItems: IBabelConfigItem[] = [], useMinifyOptions: boolean = false): {}[] {
	const namesInUserItems = new Set(userItems.map(item => item.file.resolved));
	const namesInForcedItems = new Set(forcedItems.map(item => item.file.resolved));
	const userItemsHasYearlyPreset = [...namesInUserItems].some(isYearlyBabelPreset);

	return (
		[
			// Only use those default items that doesn't appear within the forced items or the user-provided items.
			// If the options contains a yearly preset such as "preset-es2015", filter out preset-env from the default items if it is given
			...defaultItems.filter(item => !namesInUserItems.has(item.file.resolved) && !namesInForcedItems.has(item.file.resolved) && (!userItemsHasYearlyPreset || !isBabelPresetEnv(item.file.resolved))),

			// Only use those user items that doesn't appear within the forced items
			...userItems.filter(item => !namesInForcedItems.has(item.file.resolved)),

			// Apply the forced items at all times
			...forcedItems
		]
			// Filter out those options that do not apply depending on whether or not to apply minification
			.filter(configItem => (useMinifyOptions ? configItemIsAllowedDuringMinification(configItem) : configItemIsAllowedDuringNoMinification(configItem)))
	);
}

/**
 * Returns true if the given configItem is related to minification
 * @param {string} resolved
 * @returns {boolean}
 */
function configItemIsMinificationRelated({file: {resolved}}: IBabelConfigItem): boolean {
	return BABEL_MINIFY_PRESET_NAMES.some(preset => resolved.includes(preset)) || BABEL_MINIFY_PLUGIN_NAMES.some(plugin => resolved.includes(plugin));
}

/**
 * Returns true if the given configItem is allowed during minification
 * @param {string} resolved
 * @returns {boolean}
 */
function configItemIsAllowedDuringMinification({file: {resolved}}: IBabelConfigItem): boolean {
	return BABEL_MINIFICATION_BLACKLIST_PRESET_NAMES.every(preset => !resolved.includes(preset)) && BABEL_MINIFICATION_BLACKLIST_PLUGIN_NAMES.every(plugin => !resolved.includes(plugin));
}

/**
 * Returns true if the given configItem is allowed when not applying minification
 * @param {string} resolved
 * @returns {boolean}
 */
function configItemIsAllowedDuringNoMinification({file: {resolved}}: IBabelConfigItem): boolean {
	return BABEL_MINIFY_PRESET_NAMES.every(preset => !resolved.includes(preset)) && BABEL_MINIFY_PLUGIN_NAMES.every(plugin => !resolved.includes(plugin));
}

/**
 * Gets a Babel Config based on the given options
 * @param {IGetBabelConfigOptions} options
 * @returns {IGetBabelConfigResult}
 */
export function getBabelConfig({babelConfig, cwd, forcedOptions = {}, defaultOptions = {}, browserslist}: IGetBabelConfigOptions): IGetBabelConfigResult {
	// Load a partial Babel config based on the input options
	const partialConfig = loadPartialConfig(
		isBabelInputOptions(babelConfig)
			? // If the given babelConfig is an object of input options, use that as the basis for the full config
			  {...babelConfig, cwd, root: cwd, configFile: false, babelrc: false}
			: // Load the path to a babel config provided to the plugin if any, otherwise try to resolve it
			  {cwd, root: cwd, ...(babelConfig != null ? {configFile: ensureAbsolute(cwd, babelConfig)} : {})}
	);

	const {options, config} = partialConfig;
	const {presets: forcedPresets, plugins: forcedPlugins, ...otherForcedOptions} = forcedOptions;
	const {presets: defaultPresets, plugins: defaultPlugins, ...otherDefaultOptions} = defaultOptions;
	const configFileOption = {configFile: false, babelrc: false};

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
							...(preset.targets != null
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
	const combined = {
		...otherDefaultOptions,
		...options,
		...otherForcedOptions,
		presets: combineConfigItems(
			options.presets,
			defaultPresets == null ? undefined : loadPartialConfig({presets: defaultPresets, ...configFileOption}).options.presets,
			forcedPresets == null ? undefined : loadPartialConfig({presets: forcedPresets, ...configFileOption}).options.presets,
			false
		),
		plugins: combineConfigItems(
			options.plugins,
			defaultPlugins == null ? undefined : loadPartialConfig({plugins: defaultPlugins, ...configFileOption}).options.plugins,
			forcedPlugins == null ? undefined : loadPartialConfig({plugins: forcedPlugins, ...configFileOption}).options.plugins,
			false
		)
	};

	// sourceMap is an alias for 'sourceMaps'. If the user provided it, make sure it is undefined. Otherwise, Babel will fail during validation
	if ("sourceMap" in combined) {
		delete combined.sourceMap;
	}

	// Combine the partial config with the default and forced options for the minifyConfig
	const minifyCombined = {
		...combined,
		presets: combineConfigItems(
			options.presets,
			defaultPresets == null ? undefined : loadPartialConfig({presets: defaultPresets, ...configFileOption}).options.presets,
			forcedPresets == null ? undefined : loadPartialConfig({presets: forcedPresets, ...configFileOption}).options.presets,
			true
		),
		plugins: combineConfigItems(
			options.plugins,
			defaultPlugins == null ? undefined : loadPartialConfig({plugins: defaultPlugins, ...configFileOption}).options.plugins,
			forcedPlugins == null ? undefined : loadPartialConfig({plugins: forcedPlugins, ...configFileOption}).options.plugins,
			true
		)
	};

	const finalConfigFileOption = config == null ? configFileOption : {configFile: config};
	const finalMinifyConfigFileOption = config == null ? configFileOption : {configFile: `${config}.minify`};

	// Normalize the options
	return {
		config: filename => loadOptions({...combined, filename, ...finalConfigFileOption}),
		// Only return the minify config if it includes at least one plugin or preset
		minifyConfig: minifyCombined.plugins.length < 1 && minifyCombined.presets.length < 1 ? undefined : filename => loadOptions({...minifyCombined, filename, ...finalMinifyConfigFileOption}),
		hasMinifyOptions: [...minifyCombined.plugins.filter(configItemIsMinificationRelated), ...minifyCombined.presets.filter(configItemIsMinificationRelated)].length > 0
	};
}
