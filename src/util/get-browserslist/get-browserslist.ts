import {IGetBrowserslistOptions} from "./i-get-browserslist-options";
import {normalizeBrowserslist} from "@wessberg/browserslist-generator";
import {ensureAbsolute, nativeNormalize} from "../path/path-util";
import {findConfig, readConfig} from "browserslist";
import {IBrowserslistPathConfig, IBrowserslistQueryConfig} from "../../plugin/i-typescript-plugin-options";
import {ensureArray} from "../ensure-array/ensure-array";

/**
 * Returns true if the given browserslist is raw input for a Browserslist
 */
function isBrowserslistInput(browserslist: IGetBrowserslistOptions["browserslist"]): browserslist is string[] | string {
	return typeof browserslist === "string" || Array.isArray(browserslist);
}

/**
 * Returns true if the given browserslist is an IBrowserslistQueryConfig
 */
function isBrowserslistQueryConfig(browserslist: IGetBrowserslistOptions["browserslist"]): browserslist is IBrowserslistQueryConfig {
	return (
		browserslist != null && !isBrowserslistInput(browserslist) && browserslist !== false && "query" in browserslist && browserslist.query != null
	);
}

/**
 * Returns true if the given browserslist is an IBrowserslistPathConfig
 */
function isBrowserslistPathConfig(browserslist: IGetBrowserslistOptions["browserslist"]): browserslist is IBrowserslistPathConfig {
	return browserslist != null && !isBrowserslistInput(browserslist) && browserslist !== false && "path" in browserslist && browserslist.path != null;
}

/**
 * Gets a Browserslist based on the given options
 */
export function getBrowserslist({browserslist, cwd, fileSystem}: IGetBrowserslistOptions): string[] | false | undefined {
	// If a Browserslist is provided directly from the options, use that
	if (browserslist != null) {
		// If the Browserslist is equal to false, it should never be used. Return undefined
		if (browserslist === false) {
			return false;
		}

		// If the Browserslist is some raw input queries, use them directly
		else if (isBrowserslistInput(browserslist)) {
			return normalizeBrowserslist(ensureArray(browserslist));
		}

		// If the Browserslist is a config with raw query options, use them directly
		else if (isBrowserslistQueryConfig(browserslist)) {
			return normalizeBrowserslist(ensureArray(browserslist.query));
		}

		// If the Browserslist is a config with a path, attempt to resolve the Browserslist from that property
		else if (isBrowserslistPathConfig(browserslist)) {
			const browserslistPath = ensureAbsolute(cwd, browserslist.path);
			const errorMessage = `The given path for a Browserslist: '${browserslistPath}' could not be resolved from '${cwd}'`;
			if (!fileSystem.fileExists(nativeNormalize(browserslistPath))) {
				throw new ReferenceError(errorMessage);
			} else {
				// Read the config
				const match = readConfig(browserslistPath);
				if (match == null) {
					throw new ReferenceError(errorMessage);
				} else {
					return match.defaults;
				}
			}
		}

		// The config object could not be validated. Return undefined
		else {
			return undefined;
		}
	}

	// Otherwise, try to locate a Browserslist
	else {
		const config = findConfig(cwd);
		return config == null ? undefined : config.defaults;
	}
}
