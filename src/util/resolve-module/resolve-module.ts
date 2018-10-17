import {resolve} from "../resolve/resolve";
import {IResolveModuleOptions} from "./i-resolve-module-options";
import {MAIN_FIELDS, MAIN_FIELDS_BROWSER} from "../../constant/constant";

/**
 * Resolves a module based on the given options
 * @param {InputOptions} rollupInputOptions
 * @param {object} rest
 * @returns {string | undefined}
 */
export function resolveModule ({isBrowserScope, extensions, ...rest}: IResolveModuleOptions): string|undefined {
	return resolve({
		...rest,
		mainFields: isBrowserScope
			? MAIN_FIELDS_BROWSER
			: MAIN_FIELDS,
		extensions
	});
}