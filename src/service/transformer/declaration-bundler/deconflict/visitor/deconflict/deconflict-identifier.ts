import {Identifier} from "typescript";
import {DeconflictVisitorOptions} from "../../deconflict-visitor-options";

/**
 * Deconflicts the given Identifier.
 * @param {DeconflictVisitorOptions<Identifier>} options
 * @returns {Identifier?}
 */
export function deconflictIdentifier({
	node,
	updateIdentifierIfNeeded,
	lValues,
	lexicalIdentifiers
}: DeconflictVisitorOptions<Identifier>): Identifier | undefined {
	if (lValues.has(node) || (lexicalIdentifiers != null && lexicalIdentifiers.has(node.text))) return node;
	return updateIdentifierIfNeeded(node, {lValues, lexicalIdentifiers});
}
