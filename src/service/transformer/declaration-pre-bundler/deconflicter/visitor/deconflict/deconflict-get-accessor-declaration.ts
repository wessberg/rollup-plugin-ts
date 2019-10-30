import {GetAccessorDeclaration, isIdentifier} from "typescript";
import {DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";

/**
 * Deconflicts the given GetAccessorDeclaration.
 * @param {DeconflicterVisitorOptions<GetAccessorDeclaration>} options
 * @returns {VisitResult<GetAccessorDeclaration>}
 */
export function deconflictGetAccessorDeclaration({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflicterVisitorOptions<GetAccessorDeclaration>): GetAccessorDeclaration | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
