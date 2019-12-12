import {TS} from "../../../../../type/ts";
import {ExportedSymbol, SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";

export interface TrackExportsTransformerVisitorOptions<T extends TS.Node> extends SourceFileBundlerVisitorOptions {
	typescript: typeof TS;
	node: T;

	childContinuation<U extends TS.Node>(node: U): void;
	continuation<U extends TS.Node>(node: U): void;
	markAsExported(symbol: ExportedSymbol): void;
}
