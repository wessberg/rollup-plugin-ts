import {ParenthesizedTypeNode} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given ParenthesizedTypeNode.
 * @param {ParenthesizedTypeNode} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkParenthesizedTypeNode(currentNode: ParenthesizedTypeNode, {continuation}: ReferenceVisitorOptions): boolean {
	return continuation(currentNode.type);
}
