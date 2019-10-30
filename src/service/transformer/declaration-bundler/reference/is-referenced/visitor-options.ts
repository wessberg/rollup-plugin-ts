import {Node} from "typescript";
import {IsReferencedOptions} from "./is-referenced-options";
import {LocalSymbolMap} from "../../../declaration-pre-bundler/declaration-pre-bundler-options";

export interface VisitorOptions<T extends Node = Node> extends IsReferencedOptions<T> {
	identifiers: LocalSymbolMap;
	referencingNodes: Set<Node>;
	originalNode: Node;
}
