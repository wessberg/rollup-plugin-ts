import {isIdentifier, MethodDeclaration} from "typescript";
import {DeconflictVisitorOptions} from "../../deconflict-visitor-options";

/**
 * Deconflicts the given MethodDeclaration.
 * @param {DeconflictVisitorOptions<MethodDeclaration>} options
 * @returns {VisitResult<MethodDeclaration>}
 */
export function deconflictMethodDeclaration({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflictVisitorOptions<MethodDeclaration>): MethodDeclaration | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
