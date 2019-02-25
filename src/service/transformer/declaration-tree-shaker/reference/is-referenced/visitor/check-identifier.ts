import {Identifier} from "typescript";
import {ReferenceVisitorOptions} from "../reference-visitor-options";

/**
 * Visits the given Identifier.
 * @param {Identifier} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkIdentifier(currentNode: Identifier, {identifiers}: ReferenceVisitorOptions): boolean {
	// If any of the identifiers are equal to the text of this identifier, return true
	return identifiers.some(identifier => identifier === currentNode.text);
}
