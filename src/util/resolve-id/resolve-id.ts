import {IResolveModuleOptions} from "./i-resolve-module-options";
import {isBuiltInModule} from "../module/module-util";
import {ExtendedResolvedModule} from "../../service/cache/resolve-cache/i-resolve-cache";

/**
 * Resolves an id from the given parent
 * @param {IResolveModuleOptions} opts
 * @returns {ExtendedResolvedModule|null}
 */
export function resolveId({resolveCache, ...options}: IResolveModuleOptions): ExtendedResolvedModule | null {
	// Don't proceed if there is no parent (in which case this is an entry module)
	if (options.parent == null) return null;

	// Don't attempt to load built-in modules
	if (isBuiltInModule(options.id)) return null;

	return resolveCache.get(options);
}
