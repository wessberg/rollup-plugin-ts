import {TupleTypeNode} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given TupleTypeNode.
 * @param {TupleTypeNode} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkTupleTypeNode(currentNode: TupleTypeNode, {continuation}: ReferenceVisitorOptions): boolean {
	for (const typeNode of currentNode.elementTypes) {
		if (continuation(typeNode)) return true;
	}

	return false;
}
