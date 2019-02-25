import {ConditionalTypeNode} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given ConditionalTypeNode.
 * @param {ConditionalTypeNode} currentNode
 * @param {VisitorOptions} options
 */
export function visitConditionalTypeNode(currentNode: ConditionalTypeNode, {continuation}: VisitorOptions): void {
	continuation(currentNode.checkType);
	continuation(currentNode.extendsType);
	continuation(currentNode.falseType);
	continuation(currentNode.trueType);
}
