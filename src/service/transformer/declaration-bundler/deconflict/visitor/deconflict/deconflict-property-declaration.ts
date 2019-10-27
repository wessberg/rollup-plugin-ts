import {isIdentifier, PropertyDeclaration} from "typescript";
import {DeconflictVisitorOptions} from "../../deconflict-visitor-options";

/**
 * Deconflicts the given PropertyDeclaration.
 * @param {DeconflictVisitorOptions<PropertyDeclaration>} options
 * @returns {VisitResult<PropertyDeclaration>}
 */
export function deconflictPropertyDeclaration({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflictVisitorOptions<PropertyDeclaration>): PropertyDeclaration | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
