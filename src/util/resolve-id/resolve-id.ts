import {IResolveModuleOptions} from "./i-resolve-module-options";
import {isBuiltInModule} from "../module/module-util";

/**
 * Resolves an id from the given parent
 * @param {IResolveModuleOptions} opts
 * @returns {string | undefined}
 */
export function resolveId({id, parent, options, cwd, moduleResolutionHost, resolveCache}: IResolveModuleOptions): string | void {
	// Don't proceed if there is no parent (in which case this is an entry module)
	if (parent == null) return;

	// Don't attempt to load built-in modules
	if (isBuiltInModule(id)) return;

	const resolveMatch = resolveCache.get({id, parent, cwd, options, moduleResolutionHost});
	return resolveMatch == null ? undefined : resolveMatch;
}
