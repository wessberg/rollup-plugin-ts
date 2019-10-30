import {isIdentifier, PropertySignature} from "typescript";
import {DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";

/**
 * Deconflicts the given PropertySignature.
 * @param {DeconflicterVisitorOptions<PropertySignature>} options
 * @returns {VisitResult<PropertySignature>}
 */
export function deconflictPropertySignature({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflicterVisitorOptions<PropertySignature>): PropertySignature | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
