import {IntersectionTypeNode} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given IntersectionTypeNode.
 * @param {IntersectionTypeNode} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkIntersectionTypeNode(currentNode: IntersectionTypeNode, {continuation}: ReferenceVisitorOptions): boolean {
	for (const type of currentNode.types) {
		if (continuation(type)) return true;
	}

	return false;
}
