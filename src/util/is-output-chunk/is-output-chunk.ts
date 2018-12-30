import {OutputChunk, OutputAsset} from "rollup";

/**
 * Returns true if the given asset is an OutputChunk
 * @param {OutputChunk | OutputAsset} thing
 * @return {thing is OutputChunk}
 */
export function isOutputChunk (thing: OutputChunk|OutputAsset): thing is OutputChunk {
	return !("isAsset" in thing);
}