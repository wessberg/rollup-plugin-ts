import {isIdentifier, PropertyAssignment} from "typescript";
import {DeconflictVisitorOptions} from "../../deconflict-visitor-options";

/**
 * Deconflicts the given PropertyAssignment.
 * @param {DeconflictVisitorOptions<PropertyAssignment>} options
 * @returns {VisitResult<PropertyAssignment>}
 */
export function deconflictPropertyAssignment({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflictVisitorOptions<PropertyAssignment>): PropertyAssignment | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
