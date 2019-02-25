import {ParenthesizedTypeNode} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given ParenthesizedTypeNode.
 * @param {ParenthesizedTypeNode} currentNode
 * @param {VisitorOptions} options
 */
export function visitParenthesizedTypeNode(currentNode: ParenthesizedTypeNode, {continuation}: VisitorOptions): void {
	continuation(currentNode.type);
}
