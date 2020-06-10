import {NormalizedChunk, PreNormalizedChunk} from "../../../../util/chunk/normalize-chunk";

/**
 * Gets the chunk filename that matches the given filename. It may be the same.
 */
export function getChunkFilename(module: string, chunks: NormalizedChunk[]): string | undefined {
	return getChunkForModule(module, chunks)?.paths.absolute;
}

export function getChunkForModule(module: string, chunks: NormalizedChunk[]): NormalizedChunk | undefined;
export function getChunkForModule(module: string, chunks: PreNormalizedChunk[]): PreNormalizedChunk | undefined;
export function getChunkForModule(module: string, chunks: PreNormalizedChunk[] | NormalizedChunk[]): NormalizedChunk | PreNormalizedChunk | undefined {
	for (const chunk of chunks) {
		if ("has" in chunk.modules && chunk.modules.has(module)) {
			return chunk;
		} else if ("includes" in chunk.modules && chunk.modules.includes(module)) {
			return chunk;
		}
	}

	return undefined;
}
