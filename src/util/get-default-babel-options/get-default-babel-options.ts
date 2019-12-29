import {IGetDefaultBabelOptionsOptions} from "./i-get-default-babel-options-options";
import {IGetDefaultBabelOptionsResult} from "./i-get-default-babel-options-result";
import {FORCED_BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS, FORCED_BABEL_PRESET_ENV_OPTIONS} from "../../constant/constant";

/**
 * Retrieves the Babel config options that will be used by default. If the user provides the same keys/presets/plugins, *they*
 * will take precedence
 */
export function getDefaultBabelOptions({browserslist}: IGetDefaultBabelOptionsOptions): IGetDefaultBabelOptionsResult {
	const includePresetEnv = browserslist != null;

	return {
		presets: [
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
			// If preset-env will be included, shipped proposals will be included already. If not, apply them here
			...(includePresetEnv
				? []
				: [
						"@babel/plugin-proposal-object-rest-spread",
						"@babel/plugin-proposal-async-generator-functions",
						"@babel/plugin-proposal-optional-catch-binding",
						"@babel/plugin-proposal-unicode-property-regex",
						"@babel/plugin-proposal-json-strings"
				  ]),
			// Force the use of helpers (e.g. the runtime). But *don't* apply polyfills.
			[
				"@babel/plugin-transform-runtime",
				{
					...FORCED_BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS,
					corejs: false
				}
			]
		]
	};
}
