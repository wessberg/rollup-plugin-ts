import {isIdentifier, PropertySignature} from "typescript";
import {DeconflictVisitorOptions} from "../../deconflict-visitor-options";

/**
 * Deconflicts the given PropertySignature.
 * @param {DeconflictVisitorOptions<PropertySignature>} options
 * @returns {VisitResult<PropertySignature>}
 */
export function deconflictPropertySignature({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflictVisitorOptions<PropertySignature>): PropertySignature | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
