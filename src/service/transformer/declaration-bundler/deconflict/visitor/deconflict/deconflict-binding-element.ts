import {BindingElement, isIdentifier} from "typescript";
import {DeconflictVisitorOptions} from "../../deconflict-visitor-options";

/**
 * Deconflicts the given BindingElement.
 * @param {DeconflictVisitorOptions<BindingElement>} options
 * @returns {VisitResult<BindingElement>}
 */
export function deconflictBindingElement({
	node,
	childContinuation,
	lValues,
	lexicalIdentifiers
}: DeconflictVisitorOptions<BindingElement>): BindingElement | undefined {
	return childContinuation(node, {
		lValues: isIdentifier(node.name) ? new Set([...lValues, node.name]) : lValues,
		lexicalIdentifiers
	});
}
