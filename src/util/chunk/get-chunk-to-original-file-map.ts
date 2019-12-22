import {join} from "../path/path-util";
import {NormalizedChunk} from "./normalize-chunk";

export type ChunkToOriginalFileMap = Map<string, string[]>;

export function getChunkToOriginalFileMap(outDir: string, chunks: NormalizedChunk[]): ChunkToOriginalFileMap {
	return new Map(
		chunks.map(chunk => {
			return [join(outDir, chunk.fileName), chunk.modules];
		})
	);
}
