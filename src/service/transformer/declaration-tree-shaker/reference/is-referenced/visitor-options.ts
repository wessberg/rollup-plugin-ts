import {Node} from "typescript";
import {IsReferencedOptions} from "./is-referenced-options";

export interface VisitorOptions<T extends Node = Node> extends IsReferencedOptions<T> {
	identifiers: string[];
	referencingNodes: Set<Node>;
}
