import {LiteralTypeNode} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given LiteralTypeNode.
 * @param {LiteralTypeNode} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkLiteralTypeNode(currentNode: LiteralTypeNode, {continuation}: ReferenceVisitorOptions): boolean {
	return continuation(currentNode.literal);
}
