import {GetAccessorDeclaration, isIdentifier} from "typescript";
import {DeconflictVisitorOptions} from "../../deconflict-visitor-options";

/**
 * Deconflicts the given GetAccessorDeclaration.
 * @param {DeconflictVisitorOptions<GetAccessorDeclaration>} options
 * @returns {VisitResult<GetAccessorDeclaration>}
 */
export function deconflictGetAccessorDeclaration({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflictVisitorOptions<GetAccessorDeclaration>): GetAccessorDeclaration | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
