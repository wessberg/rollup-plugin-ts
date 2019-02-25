import {ArrayTypeNode} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given ArrayTypeNode.
 * @param {ArrayTypeNode} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkArrayTypeNode(currentNode: ArrayTypeNode, {continuation}: ReferenceVisitorOptions): boolean {
	return continuation(currentNode.elementType);
}
