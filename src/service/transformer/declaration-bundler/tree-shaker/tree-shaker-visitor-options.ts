import {Node, SourceFile} from "typescript";

export interface TreeShakerVisitorOptions<T extends Node> {
	node: T;
	sourceFile: SourceFile;
	continuation(node: T): T | undefined;
	isReferenced(node: Node): boolean;
}
