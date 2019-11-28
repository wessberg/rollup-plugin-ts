import {OutputChunk, OutputAsset} from "rollup";

/**
 * Returns true if the given asset is an OutputChunk
 */
export function isOutputChunk(thing: OutputChunk | OutputAsset): thing is OutputChunk {
	return !("isAsset" in thing);
}
