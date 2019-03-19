import {CompilerOptions, Extension, ModuleResolutionCache, ModuleResolutionHost, ResolvedModuleWithFailedLookupLocations, ResolvedProjectReference, resolveModuleName} from "typescript";
import {IGetResolvedIdWithCachingOptions} from "./i-get-resolved-id-with-caching-options";
import {IResolveCache} from "./i-resolve-cache";
import {ensureAbsolute, isBabelHelper, isTslib, setExtension} from "../../../util/path/path-util";
import {sync} from "find-up";
import {takeBestSubModuleFromPackage} from "../../../util/take-best-sub-module-from-package/take-best-sub-module-from-package";
import {join} from "path";
import {ensureDirectory} from "../../../util/file-system/file-system";
import {JS_EXTENSION, PACKAGE_JSON_FILENAME} from "../../../constant/constant";

/**
 * A Cache over resolved modules
 */
export class ResolveCache implements IResolveCache {
	/**
	 * A memory-persistent cache of resolved modules for files over time
	 * @type {Map<string, Map<string|null>>}
	 */
	private readonly RESOLVE_CACHE: Map<string, Map<string, string | null>> = new Map();

	/**
	 * Gets the resolved path for an id from a parent
	 * @param {string} id
	 * @param {string} parent
	 * @returns {string | null | undefined}
	 */
	public getFromCache(id: string, parent: string): string | null | undefined {
		const parentMap = this.RESOLVE_CACHE.get(parent);
		if (parentMap == null) return undefined;
		return parentMap.get(id);
	}

	/**
	 * Deletes the entry matching the given parent
	 * @param {string} parent
	 * @returns {boolean}
	 */
	public delete(parent: string): boolean {
		return this.RESOLVE_CACHE.delete(parent);
	}

	/**
	 * Sets the given resolved module in the resolve cache
	 * @param {string|null} result
	 * @param {string} id
	 * @param {string} parent
	 * @returns {string|null}
	 */
	public setInCache(result: string | null, id: string, parent: string): string | null {
		let parentMap = this.RESOLVE_CACHE.get(parent);
		if (parentMap == null) {
			parentMap = new Map();
			this.RESOLVE_CACHE.set(parent, parentMap);
		}
		parentMap.set(id, result);
		return result;
	}

	/**
	 * Resolves a module name, including internal helpers such as tslib, even if they aren't included in the language service
	 * @type {string | null}
	 */
	public resolveModuleName(
		cwd: string,
		moduleName: string,
		containingFile: string,
		compilerOptions: CompilerOptions,
		host: ModuleResolutionHost,
		cache?: ModuleResolutionCache,
		redirectedReference?: ResolvedProjectReference
	): ResolvedModuleWithFailedLookupLocations {
		// Handle tslib differently
		if (isTslib(moduleName)) {
			const tslibPath = sync(`node_modules/tslib/tslib.es6.js`, {cwd});
			if (tslibPath != null) {
				return {
					resolvedModule: {
						resolvedFileName: tslibPath,
						isExternalLibraryImport: false,
						extension: Extension.Js
					}
				};
			}
		}

		// Handle Babel helpers differently
		else if (isBabelHelper(moduleName)) {
			const babelHelperPath = sync(`node_modules/${setExtension(moduleName, JS_EXTENSION)}`, {cwd});
			if (babelHelperPath != null) {
				return {
					resolvedModule: {
						resolvedFileName: babelHelperPath,
						isExternalLibraryImport: false,
						extension: Extension.Js
					}
				};
			}
		}

		// Otherwise, default to using Typescript's resolver directly
		return resolveModuleName(moduleName, containingFile, compilerOptions, host, cache, redirectedReference);
	}

	/**
	 * Gets a cached module result for the given file from the given parent and returns it if it exists already.
	 * If not, it will compute it, update the cache, and then return it
	 * @param {IGetResolvedIdWithCachingOptions} opts
	 * @returns {string|null}
	 */
	public get({id, parent, moduleResolutionHost, options, cwd}: IGetResolvedIdWithCachingOptions): string | null {
		let cacheResult = this.getFromCache(id, parent);
		if (cacheResult != null) {
			return cacheResult;
		}

		// Resolve the file via Typescript, either through classic or node module resolution
		const {resolvedModule} = this.resolveModuleName(cwd, id, parent, options, moduleResolutionHost);

		// If it could not be resolved, the cache result will be equal to null
		if (resolvedModule == null) {
			cacheResult = null;
		}

		// Otherwise, proceed
		else {
			// Make sure that the path is absolute from the cwd
			resolvedModule.resolvedFileName = ensureAbsolute(cwd, resolvedModule.resolvedFileName);

			// If it is an external library, re-resolve since we may want to use a different package.json key than "main",
			// for example in order get the ES-module variant of the library
			if (resolvedModule.isExternalLibraryImport === true) {
				// Find the package.json located closest to the resolved file
				const packageJsonPath = sync(PACKAGE_JSON_FILENAME, {cwd: resolvedModule.resolvedFileName});
				if (packageJsonPath != null) {
					const submodule = takeBestSubModuleFromPackage(packageJsonPath);
					if (submodule != null) {
						// Rollup plays nice with ES-modules by default, so if there is any module property in the package, chances are that is using ES modules
						resolvedModule.resolvedFileName = join(ensureDirectory(packageJsonPath), submodule);
					}
				}
			}
			cacheResult = resolvedModule.resolvedFileName;
		}

		// Store the new result in the cache
		return this.setInCache(cacheResult, id, parent);
	}
}
