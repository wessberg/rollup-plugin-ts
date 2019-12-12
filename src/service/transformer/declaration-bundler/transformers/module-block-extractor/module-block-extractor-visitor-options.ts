import {TS} from "../../../../../type/ts";
import {DeclarationBundlerOptions} from "../../declaration-bundler-options";

export interface ModuleBlockExtractorVisitorOptions<T extends TS.Node> extends DeclarationBundlerOptions {
	node: T;
	context: TS.TransformationContext;

	continuation<U extends TS.Node>(node: U): TS.VisitResult<TS.Node>;
	childContinuation<U extends TS.Node>(node: U): TS.VisitResult<TS.Node>;
}
