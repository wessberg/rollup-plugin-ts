import {isIdentifier, PropertyAssignment} from "typescript";
import {DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";

/**
 * Deconflicts the given PropertyAssignment.
 * @param {DeconflicterVisitorOptions<PropertyAssignment>} options
 * @returns {VisitResult<PropertyAssignment>}
 */
export function deconflictPropertyAssignment({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflicterVisitorOptions<PropertyAssignment>): PropertyAssignment | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
