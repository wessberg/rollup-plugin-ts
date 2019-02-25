import {OptionalTypeNode} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given OptionalTypeNode.
 * @param {OptionalTypeNode} currentNode
 * @param {VisitorOptions} options
 */
export function visitOptionalTypeNode(currentNode: OptionalTypeNode, {continuation}: VisitorOptions): void {
	continuation(currentNode.type);
}
