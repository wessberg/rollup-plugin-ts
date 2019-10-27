import {isIdentifier, ParameterDeclaration} from "typescript";
import {DeconflictVisitorOptions} from "../../deconflict-visitor-options";

/**
 * Deconflicts the given ParameterDeclaration.
 * @param {DeconflictVisitorOptions<ParameterDeclaration>} options
 * @returns {VisitResult<ParameterDeclaration>}
 */
export function deconflictParameterDeclaration({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflictVisitorOptions<ParameterDeclaration>): ParameterDeclaration | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
