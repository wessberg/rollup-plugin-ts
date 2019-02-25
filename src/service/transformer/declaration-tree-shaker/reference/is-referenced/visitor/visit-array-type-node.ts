import {ArrayTypeNode} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given ArrayTypeNode.
 * @param {ArrayTypeNode} currentNode
 * @param {VisitorOptions} options
 */
export function visitArrayTypeNode(currentNode: ArrayTypeNode, {continuation}: VisitorOptions): void {
	continuation(currentNode.elementType);
}
