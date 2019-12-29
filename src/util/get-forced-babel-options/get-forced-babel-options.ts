import {IGetForcedBabelOptionsOptions} from "./i-get-forced-babel-options-options";
import {IGetForcedBabelOptionsResult} from "./i-get-forced-babel-options-result";

/**
 * Retrieves the Babel config options that will be forced
 */
export function getForcedBabelOptions({cwd}: IGetForcedBabelOptionsOptions): IGetForcedBabelOptionsResult {
	return {
		// Always produce sourcemaps. Rollup will be the decider of what to do with them.
		sourceMaps: true,
		// Always use the cwd provided to the plugin
		cwd,
		// Never let Babel be the decider of which files to include. Rather let Rollup decide that
		include: undefined,
		// Never let Babel be the decider of which files to exclude. Rather let Rollup decide that
		exclude: undefined,
		// Never let Babel be the decider of which files to ignore. Rather let Rollup decide that
		ignore: undefined,
		// Never let Babel be the decider of which files to include. Rather let Rollup decide that
		only: undefined,
		// Always parse things like modules. Rollup will then decide what to do based on the output format
		sourceType: "module",
		plugins: [
			// Needed to make babel understand dynamic imports
			require.resolve("@babel/plugin-syntax-dynamic-import")
		]
	};
}
