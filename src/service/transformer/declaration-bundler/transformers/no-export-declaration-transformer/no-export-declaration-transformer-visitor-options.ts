import {TS} from "../../../../../type/ts";
import {NodePlacementQueue} from "../../util/get-node-placement-queue";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";

export interface NoExportDeclarationTransformerVisitorOptions<T extends TS.Node> extends SourceFileBundlerVisitorOptions, NodePlacementQueue {
	typescript: typeof TS;
	node: T;

	childContinuation<U extends TS.Node>(node: U): U;
	continuation<U extends TS.Node>(node: U): U;
}
