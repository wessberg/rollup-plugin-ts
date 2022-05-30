import {TS} from "../../../../../type/ts.js";
import {NodePlacementQueue} from "../../util/get-node-placement-queue.js";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options.js";
import {NoExportDeclarationTransformerOptions} from "./no-export-declaration-transformer-options.js";

export interface NoExportDeclarationTransformerVisitorOptions<T extends TS.Node>
	extends NoExportDeclarationTransformerOptions,
		SourceFileBundlerVisitorOptions,
		NodePlacementQueue {
	typescript: typeof TS;
	node: T;

	childContinuation<U extends TS.Node>(node: U): U;
	continuation<U extends TS.Node>(node: U): U;
}
