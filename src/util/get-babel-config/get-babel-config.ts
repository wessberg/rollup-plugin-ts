import {dirname} from "path";
import {InputOptions} from "rollup";
import {IBabelConfigItem} from "../../plugin/i-babel-options";
import {isBabelPluginTransformRuntime, isBabelPresetEnv, isYearlyBabelPreset} from "../path/path-util";
import {
	BABEL_CHUNK_BLACKLIST_PLUGIN_NAMES,
	BABEL_CHUNK_BLACKLIST_PRESET_NAMES,
	BABEL_CHUNK_PLUGIN_NAMES,
	BABEL_CHUNK_PRESET_NAMES,
	FORCED_BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS,
	FORCED_BABEL_PRESET_ENV_OPTIONS,
	FORCED_BABEL_YEARLY_PRESET_OPTIONS
} from "../../constant/constant";
// @ts-ignore
import {createConfigItem, loadOptions, loadPartialConfig} from "@babel/core";
import {GetBabelConfigOptions} from "./get-babel-config-options";
import {GetBabelConfigResult} from "./get-babel-config-result";
import {findBabelConfig} from "./find-babel-config";

// tslint:disable:no-any

interface IBabelPlugin {
	key: string;
	options?: {[key: string]: unknown};
}

function getBabelItemId(item: IBabelConfigItem | IBabelPlugin): string {
	if ("file" in item) return item.file.resolved;

	const {key} = item;

	// 1) full file path to plugin entrypoint
	// 2 & 3) full module name
	if (key.startsWith("/") || key.startsWith("@") || key.startsWith("babel-plugin-")) return key;

	// add prefix to match keys defined in BABEL_CHUNK_PLUGIN_NAMES
	return `babel-plugin-${key}`;
}

/**
 * Combines the given two sets of presets
 * @param {(IBabelConfigItem | IBabelPlugin)[]} userItems
 * @param {(IBabelConfigItem | IBabelPlugin)[]} defaultItems
 * @param {(IBabelConfigItem | IBabelPlugin)[]} [forcedItems]
 * @param {boolean} [useChunkOptions]
 * @returns {{}[]}
 */
function combineConfigItems(
	userItems: (IBabelConfigItem | IBabelPlugin)[],
	defaultItems: (IBabelConfigItem | IBabelPlugin)[] = [],
	forcedItems: (IBabelConfigItem | IBabelPlugin)[] = [],
	useChunkOptions: boolean = false
): {}[] {
	const namesInUserItems = new Set(userItems.map(getBabelItemId));
	const namesInForcedItems = new Set(forcedItems.map(getBabelItemId));
	const userItemsHasYearlyPreset = [...namesInUserItems].some(isYearlyBabelPreset);

	return (
		[
			// Only use those default items that doesn't appear within the forced items or the user-provided items.
			// If the options contains a yearly preset such as "preset-es2015", filter out preset-env from the default items if it is given
			...defaultItems.filter(
				item =>
					!namesInUserItems.has(getBabelItemId(item)) &&
					!namesInForcedItems.has(getBabelItemId(item)) &&
					(!userItemsHasYearlyPreset || !isBabelPresetEnv(getBabelItemId(item)))
			),

			// Only use those user items that doesn't appear within the forced items
			...userItems.filter(item => !namesInForcedItems.has(getBabelItemId(item))),

			// Apply the forced items at all times
			...forcedItems
		]
			// Filter out those options that do not apply depending chunk generation
			.filter(configItem =>
				useChunkOptions ? configItemIsAllowedForChunk(getBabelItemId(configItem)) : configItemIsAllowedForTransform(getBabelItemId(configItem))
			)
	);
}

/**
 * Returns true if the given configItem is related to chunk transform
 * @param {string} resolved
 * @returns {boolean}
 */
function configItemIsChunkRelated(item: string | IBabelConfigItem): boolean {
	const id = typeof item === "string" ? item : getBabelItemId(item);

	return (
		(/\bminify\b/.test(id) ||
			BABEL_CHUNK_PRESET_NAMES.some(preset => id.includes(preset)) ||
			BABEL_CHUNK_PLUGIN_NAMES.some(plugin => id.includes(plugin))) &&
		!(
			BABEL_CHUNK_BLACKLIST_PLUGIN_NAMES.some(preset => id.includes(preset)) || BABEL_CHUNK_BLACKLIST_PRESET_NAMES.some(plugin => id.includes(plugin))
		)
	);
}

function configItemIsSyntaxRelated(id: string): boolean {
	return /\bsyntax\b/.test(id);
}

/**
 * Returns true if the given configItem is allowed for chunk
 * @param {string} resolved
 * @returns {boolean}
 */
function configItemIsAllowedForChunk(id: string): boolean {
	return configItemIsSyntaxRelated(id) || configItemIsChunkRelated(id);
}

/**
 * Returns true if the given configItem is allowed for transform
 * @param {string} resolved
 * @returns {boolean}
 */
function configItemIsAllowedForTransform(id: string): boolean {
	return configItemIsSyntaxRelated(id) || !configItemIsChunkRelated(id);
}

type BabelTransformOptions = Partial<ReturnType<typeof FORCED_BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS>> & {corejs?: boolean; useESModules?: boolean};

function enforceBabelTransformRuntime<T extends IBabelConfigItem | IBabelPlugin>(
	plugins: T[],
	rollupInputOptions: InputOptions,
	filename: string
): T[] {
	const babelTransformPlugin = plugins.find(item => isBabelPluginTransformRuntime(getBabelItemId(item)));

	const babelTransformOptions: BabelTransformOptions = {
		...FORCED_BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS(rollupInputOptions),
		corejs: false
	};

	if (babelTransformPlugin != null) {
		const options: BabelTransformOptions = babelTransformPlugin.options != null ? babelTransformPlugin.options : {};

		// set default options but keep explicitly defined options
		babelTransformPlugin.options = {
			...babelTransformOptions,
			...options
		};

		return plugins;
	}

	return [
		...plugins,
		// Force the use of helpers (e.g. the runtime). But *don't* apply polyfills.
		createConfigItem(["@babel/plugin-transform-runtime", babelTransformOptions], {type: "plugin", dirname: dirname(filename)})
	];
}

/**
 * Gets a Babel Config based on the given options
 * @param {GetBabelConfigOptions} options
 * @returns {GetBabelConfigResult}
 */
export function getBabelConfig({
	babelConfig,
	cwd,
	noBabelConfigCustomization,
	forcedOptions = {},
	defaultOptions = {},
	browserslist,
	rollupInputOptions
}: GetBabelConfigOptions): GetBabelConfigResult {
	const resolvedConfig = findBabelConfig({cwd, babelConfig});

	if (noBabelConfigCustomization === true) {
		const loadOptionsForFilename = (filename: string, useChunkOptions: boolean = false) => {
			const partialCustomConfig =
				resolvedConfig != null && resolvedConfig.kind === "dict"
					? // If the given babelConfig is an object of input options, use that as the basis for the full config
					  resolvedConfig
					: // Load the path to a babel config provided to the plugin if any, otherwise try to resolve it
					  loadPartialConfig({
							cwd,
							root: cwd,
							...(resolvedConfig != null ? {configFile: resolvedConfig.path} : {babelrc: true}),
							filename
					  });

			// fully load all options, which results in a flat plugins structure
			// which can then be used to match chunk plugins
			const fullOptions = loadOptions({
				...partialCustomConfig.options,
				...forcedOptions,
				presets: partialCustomConfig.options.presets,
				plugins: partialCustomConfig.options.plugins,
				filename,
				caller: {
					name: "rollup-plugin-ts",
					...(partialCustomConfig.options.caller ? partialCustomConfig.options.caller : {}),
					supportsStaticESM: true,
					supportsDynamicImport: true
				}
			});

			// sourceMap is an alias for 'sourceMaps'. If the user provided it, make sure it is undefined. Otherwise, Babel will fail during validation
			if ("sourceMap" in fullOptions) {
				delete fullOptions.sourceMap;
			}

			// Force the use of helpers (e.g. the runtime) for transform
			const plugins = useChunkOptions ? fullOptions.plugins : enforceBabelTransformRuntime(fullOptions.plugins, rollupInputOptions, filename);

			return {
				...fullOptions,
				// presets is an empty array as babel as resolved all plugins
				plugins: combineConfigItems(plugins, [], [], useChunkOptions)
			};
		};

		return {
			config: filename => loadOptionsForFilename(filename, false),
			chunkConfig: filename => loadOptionsForFilename(filename, true),
			hasChunkOptions: true
		};
	}

	// Load a partial Babel config based on the input options
	const partialConfig = loadPartialConfig(
		resolvedConfig != null && resolvedConfig.kind === "dict"
			? // If the given babelConfig is an object of input options, use that as the basis for the full config
			  {...resolvedConfig.options, cwd, root: cwd, configFile: false, babelrc: false}
			: // Load the path to a babel config provided to the plugin if any, otherwise try to resolve it
			  {
					cwd,
					root: cwd,
					...(resolvedConfig != null ? {configFile: resolvedConfig.path} : {babelrc: true})
			  }
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
							...FORCED_BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS(rollupInputOptions)
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

	// Combine the partial config with the default and forced options for the chunkConfig
	const chunkCombined = {
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
	const finalchunkConfigFileOption = config == null ? configFileOption : {configFile: `${config}.minify`};

	// Normalize the options
	return {
		config: filename => loadOptions({...combined, filename, ...finalConfigFileOption}),
		// Only return the minify config if it includes at least one plugin or preset
		chunkConfig:
			chunkCombined.plugins.length < 1 && chunkCombined.presets.length < 1
				? undefined
				: filename => loadOptions({...chunkCombined, filename, ...finalchunkConfigFileOption}),
		hasChunkOptions: [...chunkCombined.plugins.filter(configItemIsChunkRelated), ...chunkCombined.presets.filter(configItemIsChunkRelated)].length > 0
	};
}
