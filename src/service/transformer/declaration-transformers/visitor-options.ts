import {Node, SourceFile} from "typescript";
import {IDeclarationTransformersOptions} from "./i-declaration-transformers-options";

export interface VisitorOptions<T extends Node> extends IDeclarationTransformersOptions {
	node: T;
	sourceFile: SourceFile;
	continuation<U extends Node>(node: U): U;
}
