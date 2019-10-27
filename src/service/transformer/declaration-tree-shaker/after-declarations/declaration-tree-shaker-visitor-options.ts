import {Node, SourceFile} from "typescript";
import {ReferenceCache} from "../reference/cache/reference-cache";

export interface DeclarationTreeShakerVisitorOptions<T extends Node> {
	node: T;
	sourceFile: SourceFile;
	cache: ReferenceCache;
	continuation(node: T): T | undefined;
	isReferenced(node: Node): boolean;
}
