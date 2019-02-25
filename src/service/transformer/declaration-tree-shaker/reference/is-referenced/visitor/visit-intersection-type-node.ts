import {IntersectionTypeNode} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given IntersectionTypeNode.
 * @param {IntersectionTypeNode} currentNode
 * @param {VisitorOptions} options
 */
export function visitIntersectionTypeNode(currentNode: IntersectionTypeNode, {continuation}: VisitorOptions): void {
	for (const type of currentNode.types) {
		continuation(type);
	}
}
