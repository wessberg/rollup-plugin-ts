import {IGetDefaultBabelOptionsOptions} from "./i-get-default-babel-options-options";
import {IGetDefaultBabelOptionsResult} from "./i-get-default-babel-options-result";
import {FORCED_BABEL_OPTIONS} from "../../constant/constant";
import {browsersWithSupportForEcmaVersion} from "@wessberg/browserslist-generator";
import {getEcmaVersionForScriptTarget} from "../get-script-target-from-browserslist/get-script-target-from-browserslist";

/**
 * Retrieves the Babel config options that will be used by default. If the user provides the same keys/presets/plugins, *they*
 * will take precedence
 * @param {IGetDefaultBabelOptionsOptions} _options
 * @returns {IGetDefaultBabelOptionsResult}
 */
export function getDefaultBabelOptions({browserslist, originalCompilerOptions}: IGetDefaultBabelOptionsOptions): IGetDefaultBabelOptionsResult {
	const normalizedBrowserslist =
		browserslist != null
			? // If a browserslist is given, use that one
			  browserslist
			: // Otherwise, generate a browserslist based on the tsconfig target if given
			originalCompilerOptions.target == null
			? undefined
			: browsersWithSupportForEcmaVersion(getEcmaVersionForScriptTarget(originalCompilerOptions.target));
	const includePresetEnv = normalizedBrowserslist != null;

	return {
		presets: [
			// Use @babel/preset-env when a Browserslist has been given
			...(!includePresetEnv
				? []
				: [
						[
							"@babel/preset-env",
							{
								...FORCED_BABEL_OPTIONS,
								// Loose breaks things such as spreading an iterable that isn't an array
								loose: false,
								spec: false,
								debug: false,
								ignoreBrowserslistConfig: false,
								shippedProposals: true,
								targets: {
									browsers: normalizedBrowserslist
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
					corejs: false,
					helpers: true,
					regenerator: true,
					useESModules: true
				}
			]
		]
	};
}
