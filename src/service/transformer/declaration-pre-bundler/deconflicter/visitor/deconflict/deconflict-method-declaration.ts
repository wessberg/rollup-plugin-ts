import {isIdentifier, MethodDeclaration} from "typescript";
import {DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";

/**
 * Deconflicts the given MethodDeclaration.
 * @param {DeconflicterVisitorOptions<MethodDeclaration>} options
 * @returns {VisitResult<MethodDeclaration>}
 */
export function deconflictMethodDeclaration({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflicterVisitorOptions<MethodDeclaration>): MethodDeclaration | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
