import {DeclarationTransformer} from "../declaration-bundler-options";
import {TS} from "../../../../type/ts";
import {SourceFileBundlerVisitorOptions} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";
import {SourceFileTrackerVisitorOptions} from "../../cross-chunk-reference-tracker/transformers/source-file-tracker/source-file-tracker-visitor-options";
import {CrossChunkReferenceTransformer} from "../../cross-chunk-reference-tracker/cross-chunk-reference-tracker-options";

export interface ApplyTransformersDeclarationOptions {
	transformers: DeclarationTransformer[];
	visitorOptions: SourceFileBundlerVisitorOptions;
}

export interface ApplyTransformersCrossChunkReferenceOptions {
	transformers: CrossChunkReferenceTransformer[];
	visitorOptions: SourceFileTrackerVisitorOptions;
}

export type ApplyTransformersOptions = ApplyTransformersDeclarationOptions | ApplyTransformersCrossChunkReferenceOptions;

export function applyTransformers({transformers, visitorOptions}: ApplyTransformersOptions): TS.SourceFile {
	for (const transformer of transformers) {
		visitorOptions.sourceFile = transformer(visitorOptions as SourceFileBundlerVisitorOptions);
	}
	return visitorOptions.sourceFile;
}
