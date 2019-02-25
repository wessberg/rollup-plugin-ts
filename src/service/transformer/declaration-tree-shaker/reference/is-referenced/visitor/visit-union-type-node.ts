import {UnionTypeNode} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given UnionTypeNode.
 * @param {UnionTypeNode} currentNode
 * @param {VisitorOptions} options
 */
export function visitUnionTypeNode(currentNode: UnionTypeNode, {continuation}: VisitorOptions): void {
	for (const type of currentNode.types) {
		continuation(type);
	}
}
