import {IGetDefaultBabelOptionsOptions} from "./i-get-default-babel-options-options";
import {FORCED_BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS, FORCED_BABEL_PRESET_ENV_OPTIONS} from "../../constant/constant";
import {TransformOptions} from "@babel/core";

/**
 * Retrieves the Babel config options that will be used by default. If the user provides the same keys/presets/plugins, *they*
 * will take precedence
 */
export function getDefaultBabelOptions({browserslist}: IGetDefaultBabelOptionsOptions): TransformOptions {
	const includePresetEnv = browserslist != null;

	return {
		presets: [
			// Use @babel/preset-env when a Browserslist has been given
			...(!includePresetEnv
				? []
				: [
						[
							require.resolve("@babel/preset-env"),
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
						require.resolve("@babel/plugin-proposal-object-rest-spread"),
						require.resolve("@babel/plugin-proposal-async-generator-functions"),
						require.resolve("@babel/plugin-proposal-optional-catch-binding"),
						require.resolve("@babel/plugin-proposal-unicode-property-regex"),
						require.resolve("@babel/plugin-proposal-json-strings")
				  ]),
			// Force the use of helpers (e.g. the runtime). But *don't* apply polyfills.
			[
				require.resolve("@babel/plugin-transform-runtime"),
				{
					...FORCED_BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS,
					corejs: false
				}
			]
		]
	};
}
