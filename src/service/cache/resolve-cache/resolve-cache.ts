import {GetResolvedIdWithCachingOptions} from "./get-resolved-id-with-caching-options.js";
import {ExtendedResolvedModule} from "./extended-resolved-module.js";
import {ensureAbsolute, isTslib, setExtension} from "../../../util/path/path-util.js";
import {D_TS_EXTENSION, JS_EXTENSION} from "../../../constant/constant.js";
import {TS} from "../../../type/ts.js";
import path from "crosspath";

export interface ResolveCacheOptions {
	fileSystem: TS.System;
}

/**
 * A Cache over resolved modules
 */
export class ResolveCache {
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
	 * Gets a cached module result for the given file from the given parent and returns it if it exists already.
	 * If not, it will compute it, update the cache, and then return it
	 */
	get(options: GetResolvedIdWithCachingOptions): ExtendedResolvedModule | null {
		const {id, parent, moduleResolutionHost} = options;
		let cacheResult = this.getFromCache(id, parent);
		const typescript = moduleResolutionHost.getTypescript();
		const compilerOptions = moduleResolutionHost.getCompilationSettings();
		const cwd = moduleResolutionHost.getCwd();
		const nonAmbientSupportedExtensions = moduleResolutionHost.getSupportedNonAmbientExtensions();

		if (cacheResult != null) {
			return cacheResult;
		}

		// Resolve the file via Typescript, either through classic or node module resolution
		const {resolvedModule} = this.resolveModuleName(typescript, id, parent, compilerOptions, moduleResolutionHost) as {
			resolvedModule: ExtendedResolvedModule | undefined;
		};

		// If it could not be resolved, the cache result will be equal to null
		if (resolvedModule == null) {
			cacheResult = null;
		}

		// Otherwise, proceed
		else {
			// Make sure that the path is absolute from the cwd
			resolvedModule.resolvedFileName = path.includeDriveLetter(path.normalize(ensureAbsolute(cwd, resolvedModule.resolvedFileName!)));

			if (resolvedModule.resolvedFileName.endsWith(D_TS_EXTENSION)) {
				resolvedModule.resolvedAmbientFileName = resolvedModule.resolvedFileName;
				resolvedModule.resolvedFileName = undefined;
				resolvedModule.extension = D_TS_EXTENSION as TS.Extension;

				if (isTslib(id)) {
					// Sometimes the drive letter is omitted by TypeScript on Windows here, which can lead to problems
					const candidate = path.includeDriveLetter(path.normalize(setExtension(resolvedModule.resolvedAmbientFileName, `.es6${JS_EXTENSION}`)));

					if (this.options.fileSystem.fileExists(path.native.normalize(candidate))) {
						resolvedModule.resolvedFileName = candidate;
					}
				}

				// Don't go and attempt to resolve sources for external libraries
				else if (resolvedModule.isExternalLibraryImport == null || !resolvedModule.isExternalLibraryImport) {
					// Try to determine the resolved file name.
					for (const extension of nonAmbientSupportedExtensions) {
						const candidate = path.normalize(setExtension(resolvedModule.resolvedAmbientFileName, extension));

						if (this.options.fileSystem.fileExists(path.native.normalize(candidate))) {
							resolvedModule.resolvedFileName = candidate;
							break;
						}
					}
				}
			} else {
				resolvedModule.resolvedAmbientFileName = undefined;
				const candidate = path.normalize(setExtension(resolvedModule.resolvedFileName, D_TS_EXTENSION));

				if (this.options.fileSystem.fileExists(path.native.normalize(candidate))) {
					resolvedModule.resolvedAmbientFileName = candidate;
				}
			}

			cacheResult = resolvedModule;
		}

		// Store the new result in the cache
		return this.setInCache(cacheResult, id, parent);
	}
}
