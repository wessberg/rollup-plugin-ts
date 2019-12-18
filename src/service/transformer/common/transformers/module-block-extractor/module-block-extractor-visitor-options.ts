import {TS} from "../../../../../type/ts";

export interface ModuleBlockExtractorVisitorOptions<T extends TS.Node> {
	typescript: typeof TS;
	node: T;
	context: TS.TransformationContext;

	continuation<U extends TS.Node>(node: U): TS.VisitResult<TS.Node>;
	childContinuation<U extends TS.Node>(node: U): TS.VisitResult<TS.Node>;
}
