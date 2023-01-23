import type {TS} from "../../../../type/ts.js";
import type {SourceFileBundlerVisitorOptions} from "../transformers/source-file-bundler/source-file-bundler-visitor-options.js";
import type {DeclarationTransformer} from "../declaration-bundler-options.js";

export interface ApplyTransformersOptions {
	transformers: DeclarationTransformer[];
	visitorOptions: SourceFileBundlerVisitorOptions;
}

export function applyTransformers({transformers, visitorOptions}: ApplyTransformersOptions): TS.SourceFile {
	for (const transformer of transformers) {
		visitorOptions.sourceFile = transformer(visitorOptions);
	}
	return visitorOptions.sourceFile;
}
