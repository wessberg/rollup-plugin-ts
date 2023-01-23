import type {TS} from "../../../../../type/ts.js";
import type {NodePlacementQueue} from "../../util/get-node-placement-queue.js";
import type {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options.js";
import type {NoExportDeclarationTransformerOptions} from "./no-export-declaration-transformer-options.js";

export interface NoExportDeclarationTransformerVisitorOptions<T extends TS.Node>
	extends NoExportDeclarationTransformerOptions,
		SourceFileBundlerVisitorOptions,
		NodePlacementQueue {
	typescript: typeof TS;
	node: T;

	childContinuation<U extends TS.Node>(node: U): U;
	continuation<U extends TS.Node>(node: U): U;
}
