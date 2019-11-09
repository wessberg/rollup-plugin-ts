import {isIdentifier, PropertyDeclaration} from "typescript";
import {DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";

/**
 * Deconflicts the given PropertyDeclaration.
 * @param {DeconflicterVisitorOptions<PropertyDeclaration>} options
 * @returns {VisitResult<PropertyDeclaration>}
 */
export function deconflictPropertyDeclaration({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflicterVisitorOptions<PropertyDeclaration>): PropertyDeclaration | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
