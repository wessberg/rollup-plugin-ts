import {isIdentifier, MethodSignature} from "typescript";
import {DeconflictVisitorOptions} from "../../deconflict-visitor-options";

/**
 * Deconflicts the given MethodSignature.
 * @param {DeconflictVisitorOptions<MethodSignature>} options
 * @returns {VisitResult<MethodSignature>}
 */
export function deconflictMethodSignature({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflictVisitorOptions<MethodSignature>): MethodSignature | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
