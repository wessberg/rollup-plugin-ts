import {IGetEmitOutputWithCachingOptions} from "./i-get-emit-output-with-caching-options";
import {IEmitCache} from "./i-emit-cache";
import {TS} from "../../../type/ts";

/**
 * A cache over EmitOutputs
 */
export class EmitCache implements IEmitCache {
	/**
	 * A memory-persistent cache of EmitOutputs for files over time
	 */
	private readonly EMIT_CACHE: Map<string, TS.EmitOutput> = new Map();

	/**
	 * Gets an EmitOutput from the emit cache
	 */
	getFromCache(fileName: string, dtsOnly: boolean = false): TS.EmitOutput | undefined {
		return this.EMIT_CACHE.get(this.computeCacheKey(fileName, dtsOnly));
	}

	/**
	 * Deletes the entry matching the combination of fileName and whether or not only to emit declarations from the cache
	 */
	delete(fileName: string): boolean {
		const dtsCacheResult = this.EMIT_CACHE.delete(this.computeCacheKey(fileName, true));
		const nonDtsCacheResult = this.EMIT_CACHE.delete(this.computeCacheKey(fileName, false));
		return dtsCacheResult || nonDtsCacheResult;
	}

	/**
	 * Sets the given EmitOutput in the emit cache
	 */
	setInCache(emitOutput: TS.EmitOutput, fileName: string, dtsOnly: boolean = false): TS.EmitOutput {
		this.EMIT_CACHE.set(this.computeCacheKey(fileName, dtsOnly), emitOutput);
		return emitOutput;
	}

	/**
	 * Gets EmitOut and optionally retrieves it from the cache if it exists there already.
	 * If not, it will compute it, update the cache, and then return it
	 */
	get({fileName, dtsOnly, languageService}: IGetEmitOutputWithCachingOptions): TS.EmitOutput {
		const cacheResult = this.getFromCache(fileName, dtsOnly);
		if (cacheResult != null) {
			return cacheResult;
		}

		// Otherwise, generate new emit output and cache it before returning it
		const freshResult = languageService.getEmitOutput(fileName, dtsOnly);
		return this.setInCache(freshResult, fileName, dtsOnly);
	}

	/**
	 * Computes a cache key from the given combination of a file name and whether or not only to emit
	 * declaration files
	 */
	private computeCacheKey(fileName: string, dtsOnly: boolean = false): string {
		return `${fileName}.${Number(dtsOnly)}`;
	}
}
