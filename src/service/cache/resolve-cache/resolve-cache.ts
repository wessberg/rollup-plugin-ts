import {
	CompilerOptions,
	Extension,
	ModuleResolutionCache,
	ModuleResolutionHost,
	ResolvedModuleWithFailedLookupLocations,
	ResolvedProjectReference,
	resolveModuleName
} from "typescript";
import {IGetResolvedIdWithCachingOptions} from "./i-get-resolved-id-with-caching-options";
import {ExtendedResolvedModule, IResolveCache} from "./i-resolve-cache";
import {ensureAbsolute, setExtension} from "../../../util/path/path-util";
import {sync} from "find-up";
import {normalize} from "path";
import {DECLARATION_EXTENSION, JS_EXTENSION} from "../../../constant/constant";
import {FileSystem} from "../../../util/file-system/file-system";

export interface ResolveCacheOptions {
	fileSystem: FileSystem;
}

/**
 * A Cache over resolved modules
 */
export class ResolveCache implements IResolveCache {
	/**
	 * A memory-persistent cache of resolved modules for files over time
	 * @type {Map<string, Map<ExtendedResolvedModule|null>>}
	 */
	private readonly RESOLVE_CACHE: Map<string, Map<string, ExtendedResolvedModule | null>> = new Map();

	constructor(private readonly options: ResolveCacheOptions) {}

	/**
	 * Gets the resolved path for an id from a parent
	 * @param {string} id
	 * @param {string} parent
	 * @returns {ResolvedModuleFull | null | undefined}
	 */
	public getFromCache(id: string, parent: string): ExtendedResolvedModule | null | undefined {
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
	 * @param {ResolvedModule|null} result
	 * @param {string} id
	 * @param {string} parent
	 * @returns {ExtendedResolvedModule|null}
	 */
	public setInCache(result: ExtendedResolvedModule | null, id: string, parent: string): ExtendedResolvedModule | null {
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
		moduleName: string,
		containingFile: string,
		compilerOptions: CompilerOptions,
		host: ModuleResolutionHost,
		cache?: ModuleResolutionCache,
		redirectedReference?: ResolvedProjectReference
	): ResolvedModuleWithFailedLookupLocations {
		// Default to using Typescript's resolver directly
		return resolveModuleName(moduleName, containingFile, compilerOptions, host, cache, redirectedReference);
	}

	/**
	 * Finds the given helper inside node_modules (or at least attempts to)
	 * @param {string} path
	 * @param {string} cwd
	 * @return {string | undefined}
	 */
	public findHelperFromNodeModules(path: string, cwd: string): string | undefined {
		let cacheResult = this.getFromCache(path, cwd);
		if (cacheResult != null) {
			return cacheResult.resolvedFileName;
		}
		for (const resolvedPath of [sync(`node_modules/${setExtension(path, JS_EXTENSION)}`, {cwd}), sync(`node_modules/${path}/index.js`, {cwd})]) {
			if (resolvedPath != null) {
				this.setInCache(
					{
						resolvedFileName: resolvedPath,
						resolvedAmbientFileName: undefined,
						isExternalLibraryImport: false,
						extension: Extension.Js,
						packageId: undefined
					},
					path,
					cwd
				);
				return resolvedPath;
			}
		}

		return undefined;
	}

	/**
	 * Gets a cached module result for the given file from the given parent and returns it if it exists already.
	 * If not, it will compute it, update the cache, and then return it
	 * @param {IGetResolvedIdWithCachingOptions} opts
	 * @returns {ExtendedResolvedModule|null}
	 */
	public get({id, parent, moduleResolutionHost, options, cwd, supportedExtensions}: IGetResolvedIdWithCachingOptions): ExtendedResolvedModule | null {
		let cacheResult = this.getFromCache(id, parent);
		if (cacheResult != null) {
			return cacheResult;
		}

		// Resolve the file via Typescript, either through classic or node module resolution
		const {resolvedModule} = this.resolveModuleName(id, parent, options, moduleResolutionHost) as {
			resolvedModule: ExtendedResolvedModule | undefined;
		};

		// If it could not be resolved, the cache result will be equal to null
		if (resolvedModule == null) {
			cacheResult = null;
		}

		// Otherwise, proceed
		else {
			// Make sure that the path is absolute from the cwd
			resolvedModule.resolvedFileName = normalize(ensureAbsolute(cwd, resolvedModule.resolvedFileName!));

			if (resolvedModule.resolvedFileName.endsWith(DECLARATION_EXTENSION)) {
				resolvedModule.resolvedAmbientFileName = resolvedModule.resolvedFileName;
				resolvedModule.resolvedFileName = undefined;
				resolvedModule.extension = DECLARATION_EXTENSION as Extension;

				// Don't go and attempt to resolve sources for external libraries
				if (!resolvedModule.isExternalLibraryImport) {
					// Try to determine the resolved file name.
					for (const extension of supportedExtensions) {
						const candidate = normalize(setExtension(resolvedModule.resolvedAmbientFileName, extension));

						if (this.options.fileSystem.fileExists(candidate)) {
							resolvedModule.resolvedFileName = candidate;
							break;
						}
					}
				}
			} else {
				resolvedModule.resolvedAmbientFileName = undefined;
				const candidate = normalize(setExtension(resolvedModule.resolvedFileName, DECLARATION_EXTENSION));

				if (this.options.fileSystem.fileExists(candidate)) {
					resolvedModule.resolvedAmbientFileName = candidate;
				}
			}

			cacheResult = resolvedModule;
		}

		// Store the new result in the cache
		return this.setInCache(cacheResult, id, parent);
	}
}
