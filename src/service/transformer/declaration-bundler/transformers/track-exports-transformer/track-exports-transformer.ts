import type {TS} from "../../../../../type/ts.js";
import {visitNode} from "./visitor/visit-node.js";
import type {ExportedSymbol, ExportedSymbolSet, TrackExportsOptions, TrackExportsTransformerVisitorOptions} from "./track-exports-transformer-visitor-options.js";

export function trackExportsTransformer(options: TrackExportsOptions): ExportedSymbolSet {
	const {typescript} = options;
	const exportedSymbolSet: ExportedSymbolSet = new Set();

	// Prepare some VisitorOptions
	const visitorOptions: Omit<TrackExportsTransformerVisitorOptions<TS.Node>, "node"> = {
		...options,

		markAsExported(symbol: ExportedSymbol): void {
			exportedSymbolSet.add(symbol);
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
	return exportedSymbolSet;
}
