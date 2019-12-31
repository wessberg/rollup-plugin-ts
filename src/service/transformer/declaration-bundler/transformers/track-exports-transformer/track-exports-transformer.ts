import {TS} from "../../../../../type/ts";
import {visitNode} from "./visitor/visit-node";
import {
	ExportedSymbol,
	ExportedSymbolSet,
	TrackExportsOptions,
	TrackExportsTransformerVisitorOptions
} from "./track-exports-transformer-visitor-options";

export function trackExportsTransformer(options: TrackExportsOptions): TS.SourceFile {
	const {typescript} = options;
	const exportedSymbolSet: ExportedSymbolSet = new Set();
	options.sourceFileToExportedSymbolSet.set(options.sourceFile.fileName, exportedSymbolSet);

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
	return options.sourceFile;
}
