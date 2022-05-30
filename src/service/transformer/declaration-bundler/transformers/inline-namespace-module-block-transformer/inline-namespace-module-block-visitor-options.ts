import {TS} from "../../../../../type/ts.js";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options.js";
import {InlineNamespaceModuleBlockOptions} from "./inline-namespace-module-block-options.js";

export interface InlineNamespaceModuleBlockVisitorOptions<T extends TS.Node> extends SourceFileBundlerVisitorOptions, InlineNamespaceModuleBlockOptions {
	typescript: typeof TS;
	node: T;

	childContinuation<U extends TS.Node>(node: U): U;
	continuation<U extends TS.Node>(node: U): U;
}
