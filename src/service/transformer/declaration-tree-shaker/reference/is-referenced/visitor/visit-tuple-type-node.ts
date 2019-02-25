import {TupleTypeNode} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given TupleTypeNode.
 * @param {TupleTypeNode} currentNode
 * @param {VisitorOptions} options
 */
export function visitTupleTypeNode(currentNode: TupleTypeNode, {continuation}: VisitorOptions): void {
	for (const typeNode of currentNode.elementTypes) {
		continuation(typeNode);
	}
}
