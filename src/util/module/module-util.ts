// @ts-ignore
import {builtinModules as _builtInModules} from "module";
import {stripExtension} from "../path/path-util";

/**
 * The Set of all Built-in modules
 * @type {Set<string>}
 */
export const BUILT_IN_MODULES: Set<string> = new Set(_builtInModules);

/**
 * Returns true if the given module represents a built-in module
 * @param {string} moduleName
 * @returns {boolean}
 */
export function isBuiltInModule(moduleName: string): boolean {
	return BUILT_IN_MODULES.has(moduleName) || BUILT_IN_MODULES.has(stripExtension(moduleName));
}
