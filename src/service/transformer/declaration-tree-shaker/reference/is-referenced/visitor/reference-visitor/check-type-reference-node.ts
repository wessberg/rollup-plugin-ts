import {TypeReferenceNode} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given TypeReferenceNode.
 * @param {TypeReferenceNode} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkTypeReferenceNode(currentNode: TypeReferenceNode, {continuation}: ReferenceVisitorOptions): boolean {
	// If any of the identifiers are equal to the text of this identifier, return true
	return continuation(currentNode.typeName);
}
