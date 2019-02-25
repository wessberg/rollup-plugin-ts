import {UnionTypeNode} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given UnionTypeNode.
 * @param {UnionTypeNode} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkUnionTypeNode(currentNode: UnionTypeNode, {continuation}: ReferenceVisitorOptions): boolean {
	for (const type of currentNode.types) {
		if (continuation(type)) return true;
	}

	return false;
}
