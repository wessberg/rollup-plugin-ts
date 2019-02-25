import {TypeLiteralNode} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given TypeLiteralNode.
 * @param {TypeLiteralNode} currentNode
 * @param {VisitorOptions} options
 */
export function visitTypeLiteralNode(currentNode: TypeLiteralNode, {continuation}: VisitorOptions): void {
	for (const member of currentNode.members) {
		continuation(member);
	}
}
