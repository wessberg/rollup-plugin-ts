import type {TS} from "../../../../../type/ts.js";
import type {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options.js";

export interface EnsureNoDeclareModifierTransformerVisitorOptions<T extends TS.Node> extends SourceFileBundlerVisitorOptions {
	typescript: typeof TS;
	node: T;

	childContinuation<U extends TS.Node>(node: U): U;
	continuation<U extends TS.Node>(node: U): U;
}
