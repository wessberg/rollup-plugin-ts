import {TS} from "../../../../../type/ts";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";

export interface EnsureNoExportModifierTransformerVisitorOptions<T extends TS.Node> extends SourceFileBundlerVisitorOptions {
	typescript: typeof TS;
	node: T;

	childContinuation<U extends TS.Node>(node: U): U;
	continuation<U extends TS.Node>(node: U): U;
}
