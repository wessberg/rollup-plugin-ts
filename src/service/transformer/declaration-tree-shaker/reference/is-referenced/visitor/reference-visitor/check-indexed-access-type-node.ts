import {IndexedAccessTypeNode} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given IndexedAccessTypeNode.
 * @param {IndexedAccessTypeNode} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkIndexedAccessTypeNode(currentNode: IndexedAccessTypeNode, {continuation}: ReferenceVisitorOptions): boolean {
	if (continuation(currentNode.indexType)) return true;
	if (continuation(currentNode.objectType)) return true;

	return false;
}
