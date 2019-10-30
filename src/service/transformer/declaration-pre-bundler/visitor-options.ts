import {Node, SourceFile} from "typescript";
import {DeclarationPreBundlerOptions} from "./declaration-pre-bundler-options";

export interface VisitorOptions<T extends Node> extends DeclarationPreBundlerOptions {
	node: T;
	sourceFile: SourceFile;
	continuation<U extends Node>(node: U): U | undefined;
	childContinuation<U extends Node>(node: U): U | undefined;
}
