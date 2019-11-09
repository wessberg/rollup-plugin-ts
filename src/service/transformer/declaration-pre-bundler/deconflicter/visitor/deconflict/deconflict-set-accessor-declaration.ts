import {isIdentifier, SetAccessorDeclaration} from "typescript";
import {DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";

/**
 * Deconflicts the given SetAccessorDeclaration.
 * @param {DeconflicterVisitorOptions<SetAccessorDeclaration>} options
 * @returns {VisitResult<SetAccessorDeclaration>}
 */
export function deconflictSetAccessorDeclaration({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflicterVisitorOptions<SetAccessorDeclaration>): SetAccessorDeclaration | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
