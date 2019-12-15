import {TS} from "../../../../../type/ts";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";

export interface ModuleBlockExtractorVisitorOptions<T extends TS.Node> extends SourceFileBundlerVisitorOptions {
	node: T;
	context: TS.TransformationContext;

	continuation<U extends TS.Node>(node: U): TS.VisitResult<TS.Node>;
	childContinuation<U extends TS.Node>(node: U): TS.VisitResult<TS.Node>;
}
