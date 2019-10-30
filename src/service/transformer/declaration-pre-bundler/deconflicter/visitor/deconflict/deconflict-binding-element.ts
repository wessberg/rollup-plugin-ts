import {BindingElement, isIdentifier} from "typescript";
import {DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";

/**
 * Deconflicts the given BindingElement.
 * @param {DeconflicterVisitorOptions<BindingElement>} options
 * @returns {VisitResult<BindingElement>}
 */
export function deconflictBindingElement({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflicterVisitorOptions<BindingElement>): BindingElement | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
