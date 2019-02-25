import {IndexedAccessTypeNode} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given IndexedAccessTypeNode.
 * @param {IndexedAccessTypeNode} currentNode
 * @param {VisitorOptions} options
 */
export function visitIndexedAccessTypeNode(currentNode: IndexedAccessTypeNode, {continuation}: VisitorOptions): void {
	continuation(currentNode.indexType);
	continuation(currentNode.objectType);
}
