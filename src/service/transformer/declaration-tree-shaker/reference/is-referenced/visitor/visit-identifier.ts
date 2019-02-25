import {Identifier} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given Identifier.
 * @param {Identifier} currentNode
 * @param {VisitorOptions} options
 */
export function visitIdentifier(currentNode: Identifier, {identifiers, context, referencingNodes}: VisitorOptions): void {
	if (context == null) return;

	// If any of the identifiers are equal to the text of this identifier, return true
	if (identifiers.some(identifier => identifier === currentNode.text)) {
		referencingNodes.add(context);
	}
}
