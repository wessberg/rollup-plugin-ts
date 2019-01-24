import {sync} from "resolve";
import {isAbsolute} from "path";
import {IResolveOptions} from "./i-resolve-options";
import {ensureDirectory} from "../file-system/file-system";

/**
 * A map between id's and their results from previous resolving
 * @type {Map<string, string|undefined>}
 */
const cache: Map<string, string | null> = new Map();

/**
 * A function that can resolve a file from the given options
 * @param {IResolveOptions} [options={}]
 */
export function resolve({
	id,
	parent = process.cwd(),
	mainFields = ["module", "es2015", "jsnext:main", "main"],
	extensions = [".js", ".mjs", ".jsx", ".ts", ".tsx", ".json"]
}: IResolveOptions): string | undefined {
	// If the given id is already an absolute path, it is resolved already
	if (isAbsolute(id)) return id;

	// Attempt to take the resolve result from the cache
	const cacheResult = cache.get(id);

	// If it is a proper path, return it
	if (cacheResult != null) return cacheResult;

	// Otherwise, if the cache result isn't strictly equal to 'undefined', it has previously been resolved to a non-existing file
	if (cacheResult === null) return undefined;

	// Otherwise, try to resolve it and put it in the cache
	try {
		const resolveResult = sync(id, {
			basedir: ensureDirectory(parent),
			extensions,
			packageFilter(pkg: {main: string}): {main: string} {
				let property: (keyof typeof pkg) | undefined;

				const packageKeys = Object.keys(pkg);
				property = <keyof typeof pkg>mainFields.find(key => packageKeys.includes(key));

				// If a property was resolved, set the 'main' property to it (resolve will use the main property no matter what)
				if (property != null) {
					pkg.main = pkg[property];
				}

				// Return the package
				return pkg;
			}
		});

		// Add it to the cache
		cache.set(id, resolveResult);

		// Return it
		return resolveResult;
	} catch (ex) {
		// No file could be resolved. Set it in the cache as unresolvable and return void
		cache.set(id, null);
		return undefined;
	}
}
