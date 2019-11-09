import {MergeChunksWithAmbientDependenciesResult} from "./merge-chunks-with-ambient-dependencies";
import {join} from "path";

export type IsAmbient = boolean;
export type ChunkToOriginalFileMap = Map<string, [string, IsAmbient][]>;

export function getChunkToOriginalFileMap(
	outDir: string,
	{ambientModules, mergedChunks}: MergeChunksWithAmbientDependenciesResult
): ChunkToOriginalFileMap {
	return new Map(
		mergedChunks.map(chunk => {
			return [join(outDir, chunk.fileName), chunk.modules.map(module => [module, ambientModules.has(module)])];
		})
	);
}
