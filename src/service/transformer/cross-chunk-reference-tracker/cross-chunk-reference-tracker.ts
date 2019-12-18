import {CrossChunkReferenceTrackerOptions} from "./cross-chunk-reference-tracker-options";
import {TS} from "../../../type/ts";
import {sourceFileTracker} from "./transformers/source-file-tracker/source-file-tracker";
import {moduleBlockExtractor} from "../common/transformers/module-block-extractor/module-block-extractor";
import {trackExportsTransformer} from "./transformers/track-exports-transformer/track-exports-transformer";
import {trackImportsTransformer} from "./transformers/track-imports-transformer/track-imports-transformer";

export function crossChunkReferenceTracker(options: CrossChunkReferenceTrackerOptions): TS.CustomTransformers {
	return {
		afterDeclarations: [
			// Bundle all SourceFiles within the declaration bundle
			sourceFileTracker(options, moduleBlockExtractor, trackExportsTransformer, trackImportsTransformer)
		]
	};
}
