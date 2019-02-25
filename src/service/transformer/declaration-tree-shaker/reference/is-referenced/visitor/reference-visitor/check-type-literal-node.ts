import {TypeLiteralNode} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given TypeLiteralNode.
 * @param {TypeLiteralNode} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkTypeLiteralNode(currentNode: TypeLiteralNode, {continuation}: ReferenceVisitorOptions): boolean {
	for (const member of currentNode.members) {
		if (continuation(member)) return true;
	}

	return false;
}
