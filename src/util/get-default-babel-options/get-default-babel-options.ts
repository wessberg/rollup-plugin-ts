import {IGetDefaultBabelOptionsOptions} from "./i-get-default-babel-options-options";
import {IGetDefaultBabelOptionsResult} from "./i-get-default-babel-options-result";
import {FORCED_BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS, FORCED_BABEL_PRESET_ENV_OPTIONS} from "../../constant/constant";

/**
 * Retrieves the Babel config options that will be used by default. If the user provides the same keys/presets/plugins, *they*
 * will take precedence
 * @param {IGetDefaultBabelOptionsOptions} _options
 * @returns {IGetDefaultBabelOptionsResult}
 */
export function getDefaultBabelOptions({browserslist, rollupInputOptions}: IGetDefaultBabelOptionsOptions): IGetDefaultBabelOptionsResult {
	const includePresetEnv = browserslist != null;

	return {
		presets: [
			"proposal-typescript",
			// Use @babel/preset-env when a Browserslist has been given
			...(!includePresetEnv
				? []
				: [
						[
							"@babel/preset-env",
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
				  ])
		],
		plugins: [
			// Force the use of helpers (e.g. the runtime). But *don't* apply polyfills.
			[
				"@babel/plugin-transform-runtime",
				{
					...FORCED_BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS(rollupInputOptions),
					corejs: false
				}
			]
		]
	};
}
