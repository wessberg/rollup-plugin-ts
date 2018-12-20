import {Node, SourceFile} from "typescript";
import {IReferenceCache} from "../cache/i-reference-cache";
import {IDeclarationTransformersOptions} from "../i-declaration-transformers-options";

export interface VisitorOptions<T extends Node> extends IDeclarationTransformersOptions {
	node: T;
	sourceFile: SourceFile;
	cache: IReferenceCache;
}