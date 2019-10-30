import {isIdentifier, MethodSignature} from "typescript";
import {DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";

/**
 * Deconflicts the given MethodSignature.
 * @param {DeconflicterVisitorOptions<MethodSignature>} options
 * @returns {VisitResult<MethodSignature>}
 */
export function deconflictMethodSignature({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflicterVisitorOptions<MethodSignature>): MethodSignature | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
