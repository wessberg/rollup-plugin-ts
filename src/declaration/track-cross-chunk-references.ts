import {IncrementalLanguageService} from "../service/language-service/incremental-language-service";
import {MergedChunk} from "../util/chunk/merge-chunks-with-ambient-dependencies";
import {ChunkToOriginalFileMap} from "../util/chunk/get-chunk-to-original-file-map";

export interface TrackCrossChunkReferencesOptions {
	chunks: MergedChunk[];
	cwd: string;
	generateMap: boolean;
	languageServiceHost: IncrementalLanguageService;
	chunkToOriginalFileMap: ChunkToOriginalFileMap;
}

export interface CrossChunkReference {
	chunk: string;
	referencedChunk: string;
}

export function trackCrossChunkReferences(_options: TrackCrossChunkReferencesOptions): void {}
