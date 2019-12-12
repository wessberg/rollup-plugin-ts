import {TS} from "../../../../../type/ts";
import {ExportedSymbol, ExportedSymbolSet, SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";
import {visitNode} from "./visitor/visit-node";
import {TrackExportsTransformerVisitorOptions} from "./track-exports-transformer-visitor-options";

export function trackExportsTransformer({typescript, context, ...options}: SourceFileBundlerVisitorOptions): TS.SourceFile {
	const exportedSymbolSet: ExportedSymbolSet = new Set();
	options.sourceFileToExportedSymbolSet.set(options.sourceFile.fileName, exportedSymbolSet);

	// Prepare some VisitorOptions
	const visitorOptions: Omit<TrackExportsTransformerVisitorOptions<TS.Node>, "node"> = {
		...options,
		context,
		typescript,

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
