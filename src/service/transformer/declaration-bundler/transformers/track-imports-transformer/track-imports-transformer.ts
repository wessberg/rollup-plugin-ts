import type {TS} from "../../../../../type/ts.js";
import {visitNode} from "./visitor/visit-node.js";
import type {ImportedSymbol, ImportedSymbolSet, TrackImportsOptions, TrackImportsTransformerVisitorOptions} from "./track-imports-transformer-visitor-options.js";

export function trackImportsTransformer(options: TrackImportsOptions): ImportedSymbolSet {
	const {typescript} = options;
	const importedSymbolSet: ImportedSymbolSet = new Set();

	// Prepare some VisitorOptions
	const visitorOptions: Omit<TrackImportsTransformerVisitorOptions<TS.Node>, "node"> = {
		...options,
		// Optimization: We only need to traverse nested nodes inside of the SourceFile if it contains at least one ImportTypeNode (or at least what appears to be one)
		shouldDeepTraverse: options.sourceFile.text.includes("import("),

		markAsImported(symbol: ImportedSymbol): void {
			importedSymbolSet.add(symbol);
		},

		childContinuation: <U extends TS.Node>(node: U): void =>
			typescript.forEachChild(node, nextNode => {
				visitNode({
					...visitorOptions,
					node: nextNode
				});
			}),

		continuation: <U extends TS.Node>(node: U): void => {
			visitNode({
				...visitorOptions,
				node
			});
		}
	};

	typescript.forEachChild(options.sourceFile, nextNode => {
		visitorOptions.continuation(nextNode);
	});
	return importedSymbolSet;
}
