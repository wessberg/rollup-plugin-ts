import {ResolveModuleOptions} from "./resolve-module-options.js";
import {ExtendedResolvedModule} from "../../service/cache/resolve-cache/extended-resolved-module.js";

/**
 * Resolves an id from the given parent
 */
export function resolveId({resolveCache, ...options}: ResolveModuleOptions): ExtendedResolvedModule | null {
	// Don't proceed if there is no parent (in which case this is an entry module)
	if (options.parent == null) return null;

	return resolveCache.get(options);
}
