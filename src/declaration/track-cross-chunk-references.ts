import {IncrementalLanguageService} from "../service/language-service/incremental-language-service";
import {MergedChunk} from "../util/chunk/merge-chunks-with-ambient-dependencies";
import {ChunkToOriginalFileMap} from "../util/chunk/get-chunk-to-original-file-map";
import {trackExportsTransformer} from "../service/transformer/declaration-bundler/transformers/track-exports-transformer/track-exports-transformer";
import {TrackExportsOptions} from "../service/transformer/declaration-bundler/transformers/track-exports-transformer/track-exports-transformer-visitor-options";
import {SourceFileToExportedSymbolSet} from "../service/transformer/declaration-bundler/transformers/source-file-bundler/source-file-bundler-visitor-options";

export interface TrackCrossChunkReferencesOptions extends Omit<TrackExportsOptions, "sourceFile" | "sourceFileToExportedSymbolSet"> {
	chunks: MergedChunk[];
	cwd: string;
	generateMap: boolean;
	languageServiceHost: IncrementalLanguageService;
	chunkToOriginalFileMap: ChunkToOriginalFileMap;
}

export function trackCrossChunkReferences(options: TrackCrossChunkReferencesOptions): SourceFileToExportedSymbolSet {
	const sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet = new Map();

	for (const chunk of options.chunks) {
		for (const module of chunk.modules) {
			const sourceFile = options.languageServiceHost.getSourceFile(module);

			if (sourceFile != null) {
				trackExportsTransformer({
					...options,
					sourceFileToExportedSymbolSet,
					sourceFile
				});
			}
		}
	}
	return sourceFileToExportedSymbolSet;
}
