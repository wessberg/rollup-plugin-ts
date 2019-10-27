import {Node, SourceFile, VisitResult} from "typescript";
import {IDeclarationBundlerOptions} from "../i-declaration-bundler-options";

export interface PathMappingRewriterVisitorOptions<T extends Node> extends IDeclarationBundlerOptions {
	node: T;
	sourceFile: SourceFile;
	continuation<U extends Node>(node: U): VisitResult<U>;
}
