import {OptionalTypeNode} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given OptionalTypeNode.
 * @param {OptionalTypeNode} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkOptionalTypeNode(currentNode: OptionalTypeNode, {continuation}: ReferenceVisitorOptions): boolean {
	return continuation(currentNode.type);
}
