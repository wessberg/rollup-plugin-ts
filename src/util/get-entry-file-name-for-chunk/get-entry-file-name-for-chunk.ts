import {OutputChunk} from "rollup";

/**
 * Gets the entry filename for the given OutputChunk
 * @param {OutputChunk} chunk
 * @param {Function} canEmitForFile
 * @return {string}
 */
export function getEntryFileNameForChunk (chunk: OutputChunk, canEmitForFile: (id: string) => boolean): string {
	return Object.keys(chunk.modules)
		.filter(canEmitForFile)
		.slice(-1)[0];
}