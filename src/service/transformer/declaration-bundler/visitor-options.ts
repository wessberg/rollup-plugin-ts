import {Node, SourceFile} from "typescript";
import {IDeclarationBundlerOptions} from "./i-declaration-bundler-options";

export interface VisitorOptions<T extends Node> extends IDeclarationBundlerOptions {
	node: T;
	sourceFile: SourceFile;
	continuation<U extends Node>(node: U): U;
}
