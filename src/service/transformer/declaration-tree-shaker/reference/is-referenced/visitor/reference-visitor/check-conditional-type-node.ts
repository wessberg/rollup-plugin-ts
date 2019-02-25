import {ConditionalTypeNode} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given ConditionalTypeNode.
 * @param {ConditionalTypeNode} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkConditionalTypeNode(currentNode: ConditionalTypeNode, {continuation}: ReferenceVisitorOptions): boolean {
	if (continuation(currentNode.checkType)) return true;
	if (continuation(currentNode.extendsType)) return true;
	if (continuation(currentNode.falseType)) return true;
	if (continuation(currentNode.trueType)) return true;

	return false;
}
