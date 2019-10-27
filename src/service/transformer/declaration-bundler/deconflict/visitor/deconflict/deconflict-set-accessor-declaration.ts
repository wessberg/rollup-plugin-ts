import {isIdentifier, SetAccessorDeclaration} from "typescript";
import {DeconflictVisitorOptions} from "../../deconflict-visitor-options";

/**
 * Deconflicts the given SetAccessorDeclaration.
 * @param {DeconflictVisitorOptions<SetAccessorDeclaration>} options
 * @returns {VisitResult<SetAccessorDeclaration>}
 */
export function deconflictSetAccessorDeclaration({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflictVisitorOptions<SetAccessorDeclaration>): SetAccessorDeclaration | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
