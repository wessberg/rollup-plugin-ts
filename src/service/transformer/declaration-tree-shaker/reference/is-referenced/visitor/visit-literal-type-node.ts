import {LiteralTypeNode} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given LiteralTypeNode.
 * @param {LiteralTypeNode} currentNode
 * @param {VisitorOptions} options
 */
export function visitLiteralTypeNode(currentNode: LiteralTypeNode, {continuation}: VisitorOptions): void {
	continuation(currentNode.literal);
}
