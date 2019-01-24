import {EmitOutput} from "typescript";
import {IGetEmitOutputWithCachingOptions} from "./i-get-emit-output-with-caching-options";
import {IEmitCache} from "./i-emit-cache";

/**
 * A cache over EmitOutputs
 */
export class EmitCache implements IEmitCache {
	/**
	 * A memory-persistent cache of EmitOutputs for files over time
	 * @type {Map<string, EmitOutput>}
	 */
	private readonly EMIT_CACHE: Map<string, EmitOutput> = new Map();

	/**
	 * Gets an EmitOutput from the emit cache
	 * @param {string} fileName
	 * @param {boolean} [dtsOnly=false]
	 * @returns {EmitOutput | undefined}
	 */
	public getFromCache(fileName: string, dtsOnly: boolean = false): EmitOutput | undefined {
		return this.EMIT_CACHE.get(this.computeCacheKey(fileName, dtsOnly));
	}

	/**
	 * Deletes the entry matching the combination of fileName and whether or not only to emit declarations from the cache
	 * @param {string} fileName
	 * @returns {boolean}
	 */
	public delete(fileName: string): boolean {
		const dtsCacheResult = this.EMIT_CACHE.delete(this.computeCacheKey(fileName, true));
		const nonDtsCacheResult = this.EMIT_CACHE.delete(this.computeCacheKey(fileName, false));
		return dtsCacheResult || nonDtsCacheResult;
	}

	/**
	 * Sets the given EmitOutput in the emit cache
	 * @param {EmitOutput} emitOutput
	 * @param {string} fileName
	 * @param {boolean} [dtsOnly=false]
	 * @returns {EmitOutput}
	 */
	public setInCache(emitOutput: EmitOutput, fileName: string, dtsOnly: boolean = false): EmitOutput {
		this.EMIT_CACHE.set(this.computeCacheKey(fileName, dtsOnly), emitOutput);
		return emitOutput;
	}

	/**
	 * Gets EmitOut and optionally retrieves it from the cache if it exists there already.
	 * If not, it will compute it, update the cache, and then return it
	 * @param {IGetEmitOutputWithCachingOptions} options
	 * @returns {EmitOutput}
	 */
	public get({fileName, dtsOnly, languageService}: IGetEmitOutputWithCachingOptions): EmitOutput {
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
	 * @param {string} fileName
	 * @param {boolean} dtsOnly
	 * @returns {string}
	 */
	private computeCacheKey(fileName: string, dtsOnly: boolean = false): string {
		return `${fileName}.${Number(dtsOnly)}`;
	}
}
