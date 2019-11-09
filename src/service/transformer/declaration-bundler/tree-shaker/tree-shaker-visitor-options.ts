import {Node, SourceFile} from "typescript";

export interface TreeShakerVisitorOptions<T extends Node> {
	node: T;
	sourceFile: SourceFile;
	continuation<U extends Node>(node: U): U | undefined;
	isReferenced(node: Node): boolean;
}
