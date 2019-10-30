import {isIdentifier, ParameterDeclaration} from "typescript";
import {DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";

/**
 * Deconflicts the given ParameterDeclaration.
 * @param {DeconflicterVisitorOptions<ParameterDeclaration>} options
 * @returns {VisitResult<ParameterDeclaration>}
 */
export function deconflictParameterDeclaration({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflicterVisitorOptions<ParameterDeclaration>): ParameterDeclaration | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
