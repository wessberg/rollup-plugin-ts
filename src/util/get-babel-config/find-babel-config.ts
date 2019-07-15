import {BABEL_CONFIG_JS_FILENAME} from "../../constant/constant";
import {join} from "path";
import {FindBabelConfigOptions} from "./find-babel-config-options";
import {ensureAbsolute} from "../path/path-util";
import {FindBabelConfigResult} from "./find-babel-config-result";
import {IBabelInputOptions} from "../../plugin/i-babel-options";
// @ts-ignore
import {findConfigUpwards, findRelativeConfig} from "@babel/core/lib/config/files/configuration";
// @ts-ignore
import {findPackageData} from "@babel/core/lib/config/files/package";

/**
 * Returns true if the given babelConfig is IBabelInputOptions
 * @param {FindBabelConfigOptions["babelConfig"]} babelConfig
 * @returns {babelConfig is IBabelInputOptions}
 */
export function isBabelInputOptions(babelConfig?: FindBabelConfigOptions["babelConfig"]): babelConfig is Partial<IBabelInputOptions> {
	return babelConfig != null && typeof babelConfig !== "string";
}

/**
 * Gets a Babel Config based on the given options
 * @param {GetBabelConfigOptions} options
 * @returns {GetBabelConfigResult}
 */
export function findBabelConfig({babelConfig, cwd}: FindBabelConfigOptions): FindBabelConfigResult | undefined {
	// If babel options are provided directly
	if (isBabelInputOptions(babelConfig)) {
		return {
			kind: "dict",
			options: babelConfig
		};
	}

	// If a config is given, determine its kind from its file name.
	if (babelConfig != null) {
		// This looks like a .babelrc or .babelrc.js file
		if (babelConfig.startsWith(".babel")) {
			return {
				kind: "relative",
				path: ensureAbsolute(cwd, babelConfig)
			};
		}

		// This looks like a project-wide config (such as babel.config.js)
		else {
			return {
				kind: "project",
				path: ensureAbsolute(cwd, babelConfig)
			};
		}
	}

	// In all other cases, try to resolve a config. Prioritize project-wide configs such as 'babel.config.js'
	// over relative ones such as '.babelrc'
	const projectConfigPath = findConfigUpwards(cwd) as string | null;

	// The resolved config will actually be the directory holding the config.
	// If it is defined, join the default config name to it
	if (projectConfigPath != null) {
		return {
			kind: "project",
			// The resolved config will actually be the directory holding the config.
			// If it is defined, join the default config name to it
			path: join(projectConfigPath, BABEL_CONFIG_JS_FILENAME)
		};
	}

	// If no config have been resolved, it might be possible to resolve a .babelrc or .babelrc.js file
	const pkgData = findPackageData(join(cwd, "package.json"));
	const relativeConfigResult = findRelativeConfig(pkgData, process.env.NODE_ENV) as {config: {filepath: string} | null} | null;
	if (relativeConfigResult != null && relativeConfigResult.config != null) {
		return {
			kind: "relative",
			path: relativeConfigResult.config.filepath
		};
	}

	// No config could be resolved
	return undefined;
}
