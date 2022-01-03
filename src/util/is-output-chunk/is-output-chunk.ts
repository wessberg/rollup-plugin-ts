import {OutputChunk, OutputAsset} from "rollup";

/**
 * Returns true if the given asset is an OutputChunk
 */
export function isOutputChunk(thing: OutputChunk | OutputAsset): thing is OutputChunk {
	return thing.type === "chunk";
}

/**
 * Returns true if the given asset is an OutputChunk
 */
 export function isOutputAssetOrOutputChunk(thing: OutputChunk | OutputAsset): thing is OutputChunk|OutputAsset {
	return thing.type === "chunk" || thing.type === "asset";
}
