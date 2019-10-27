import {Node} from "typescript";
import {ReferenceCache} from "../cache/reference-cache";

export interface VisitorOptions<T extends Node = Node> {
	identifier: string;
	referencingNodes: Set<Node>;

	cache: ReferenceCache;
	seenNodes?: Set<Node>;
	node: T;
	originalNode: Node;
}
