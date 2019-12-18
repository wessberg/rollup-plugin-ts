import {CrossChunkReferenceTrackerOptions, CrossChunkReferenceTransformer} from "../../cross-chunk-reference-tracker-options";
import {applyTransformers} from "../../../declaration-bundler/util/apply-transformers";
import {TS} from "../../../../../type/ts";
import {SourceFileTrackerVisitorOptions} from "./source-file-tracker-visitor-options";

export function sourceFileTracker(
	options: CrossChunkReferenceTrackerOptions,
	...transformers: CrossChunkReferenceTransformer[]
): TS.TransformerFactory<TS.Bundle> {
	return context => {
		return bundle => {
			bundle.sourceFiles.forEach(sourceFile => {
				for (const statement of sourceFile.statements) {
					if (options.typescript.isModuleDeclaration(statement)) {
						options.moduleSpecifierToSourceFileMap.set(statement.name.text, sourceFile);
					}
				}
			});

			for (const sourceFile of bundle.sourceFiles) {
				// Prepare some VisitorOptions
				const visitorOptions: SourceFileTrackerVisitorOptions = {
					...options,
					context,
					sourceFile
				};

				applyTransformers({visitorOptions, transformers});
			}
			return bundle;
		};
	};
}
