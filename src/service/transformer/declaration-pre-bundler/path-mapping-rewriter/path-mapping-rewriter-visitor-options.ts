import {Node, SourceFile, VisitResult} from "typescript";
import {DeclarationPreBundlerOptions} from "../declaration-pre-bundler-options";

export interface PathMappingRewriterVisitorOptions<T extends Node> extends DeclarationPreBundlerOptions {
	node: T;
	sourceFile: SourceFile;
	continuation<U extends Node>(node: U): VisitResult<U>;
}
