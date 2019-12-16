import {TS} from "../../../../../type/ts";
import {ExportedSymbol, SourceFileToExportedSymbolSet} from "../source-file-bundler/source-file-bundler-visitor-options";
import {NodeIdentifierCache} from "../trace-identifiers/trace-identifiers";
import {Resolver} from "../../../../../util/resolve-id/resolver";

export interface TrackExportsOptions {
	typescript: typeof TS;
	sourceFile: TS.SourceFile;
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	nodeIdentifierCache: NodeIdentifierCache;
	resolver: Resolver;
}

export interface TrackExportsTransformerVisitorOptions<T extends TS.Node> extends TrackExportsOptions {
	node: T;

	childContinuation<U extends TS.Node>(node: U): void;
	continuation<U extends TS.Node>(node: U): void;
	markAsExported(symbol: ExportedSymbol): void;
}
