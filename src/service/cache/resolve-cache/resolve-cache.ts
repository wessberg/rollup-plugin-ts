import {IGetResolvedIdWithCachingOptions} from "./i-get-resolved-id-with-caching-options";
import {ExtendedResolvedModule, IResolveCache} from "./i-resolve-cache";
import {ensureAbsolute, setExtension} from "../../../util/path/path-util";
import {sync} from "find-up";
import {normalize} from "path";
import {DECLARATION_EXTENSION, JS_EXTENSION} from "../../../constant/constant";
import {FileSystem} from "../../../util/file-system/file-system";
import {TS} from "../../../type/ts";

export interface ResolveCacheOptions {
	fileSystem: FileSystem;
}

/**
 * A Cache over resolved modules
 */
export class ResolveCache implements IResolveCache {
	/**
	 * A memory-persistent cache of resolved modules for files over time
	 */
	private readonly RESOLVE_CACHE: Map<string, Map<string, ExtendedResolvedModule | null>> = new Map();

	constructor(private readonly options: ResolveCacheOptions) {}

	/**
	 * Gets the resolved path for an id from a parent
	 */
	getFromCache(id: string, parent: string): ExtendedResolvedModule | null | undefined {
		const parentMap = this.RESOLVE_CACHE.get(parent);
		if (parentMap == null) return undefined;
		return parentMap.get(id);
	}

	/**
	 * Deletes the entry matching the given parent
	 */
	delete(parent: string): boolean {
		return this.RESOLVE_CACHE.delete(parent);
	}

	clear(): void {
		this.RESOLVE_CACHE.clear();
	}

	/**
	 * Sets the given resolved module in the resolve cache
	 */
	setInCache(result: ExtendedResolvedModule | null, id: string, parent: string): ExtendedResolvedModule | null {
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
	 */
	resolveModuleName(
		typescript: typeof TS,
		moduleName: string,
		containingFile: string,
		compilerOptions: TS.CompilerOptions,
		host: TS.ModuleResolutionHost,
		cache?: TS.ModuleResolutionCache,
		redirectedReference?: TS.ResolvedProjectReference
	): TS.ResolvedModuleWithFailedLookupLocations {
		// Default to using Typescript's resolver directly
		return typescript.resolveModuleName(moduleName, containingFile, compilerOptions, host, cache, redirectedReference);
	}

	/**
	 * Finds the given helper inside node_modules (or at least attempts to)
	 */
	findHelperFromNodeModules(typescript: typeof TS, path: string, cwd: string): string | undefined {
		let cacheResult = this.getFromCache(path, cwd);
		if (cacheResult != null) {
			return cacheResult.resolvedFileName;
		}
		for (const resolvedPath of [
			sync(normalize(`node_modules/${setExtension(path, JS_EXTENSION)}`), {cwd}),
			sync(normalize(`node_modules/${path}/index.js`), {cwd})
		]) {
			if (resolvedPath != null) {
				this.setInCache(
					{
						resolvedFileName: resolvedPath,
						resolvedAmbientFileName: undefined,
						isExternalLibraryImport: false,
						extension: typescript.Extension.Js,
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
	 */
	get({
		id,
		parent,
		moduleResolutionHost,
		options,
		cwd,
		supportedExtensions,
		typescript
	}: IGetResolvedIdWithCachingOptions): ExtendedResolvedModule | null {
		let cacheResult = this.getFromCache(id, parent);

		if (cacheResult != null) {
			return cacheResult;
		}

		// Resolve the file via Typescript, either through classic or node module resolution
		const {resolvedModule} = this.resolveModuleName(typescript, id, parent, options, moduleResolutionHost) as {
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
				resolvedModule.extension = DECLARATION_EXTENSION as TS.Extension;

				// Don't go and attempt to resolve sources for external libraries
				if (resolvedModule.isExternalLibraryImport == null || !resolvedModule.isExternalLibraryImport) {
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
