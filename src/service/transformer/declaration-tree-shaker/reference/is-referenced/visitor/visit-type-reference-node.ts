import {TypeReferenceNode} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given TypeReferenceNode.
 * @param {TypeReferenceNode} currentNode
 * @param {VisitorOptions} options
 */
export function visitTypeReferenceNode(currentNode: TypeReferenceNode, {continuation}: VisitorOptions): void {
	// If any of the identifiers are equal to the text of this identifier, return true
	continuation(currentNode.typeName);
}
