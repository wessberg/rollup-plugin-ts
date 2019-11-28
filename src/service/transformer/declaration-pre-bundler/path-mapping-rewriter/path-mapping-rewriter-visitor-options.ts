import {DeclarationPreBundlerOptions} from "../declaration-pre-bundler-options";
import {TS} from "../../../../type/ts";

export interface PathMappingRewriterVisitorOptions<T extends TS.Node> extends DeclarationPreBundlerOptions {
	node: T;
	sourceFile: TS.SourceFile;
	continuation<U extends TS.Node>(node: U): TS.VisitResult<U>;
}
