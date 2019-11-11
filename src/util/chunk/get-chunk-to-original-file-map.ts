import {MergeChunksWithAmbientDependenciesResult} from "./merge-chunks-with-ambient-dependencies";
import {join} from "path";

export type ChunkToOriginalFileMap = Map<string, string[]>;

export function getChunkToOriginalFileMap(outDir: string, {mergedChunks}: MergeChunksWithAmbientDependenciesResult): ChunkToOriginalFileMap {
	return new Map(
		mergedChunks.map(chunk => {
			return [join(outDir, chunk.fileName), chunk.modules];
		})
	);
}
