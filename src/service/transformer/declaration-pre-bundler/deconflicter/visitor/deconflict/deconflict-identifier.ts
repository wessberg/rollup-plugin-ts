import {Identifier} from "typescript";
import {DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";

/**
 * Deconflicts the given Identifier.
 * @param {DeconflicterVisitorOptions<Identifier>} options
 * @returns {Identifier?}
 */
export function deconflictIdentifier({
	node,
	updateIdentifierIfNeeded,
	lValues,
	lexicalIdentifiers
}: DeconflicterVisitorOptions<Identifier>): Identifier | undefined {
	if (lValues.has(node) || (lexicalIdentifiers != null && lexicalIdentifiers.has(node.text))) return node;
	return updateIdentifierIfNeeded(node, {lValues, lexicalIdentifiers});
}
