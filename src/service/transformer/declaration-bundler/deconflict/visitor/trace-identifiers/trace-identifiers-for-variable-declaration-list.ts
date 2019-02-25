import {VariableDeclarationList} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Deconflicts the given VariableDeclarationList.
 * @param {TraceIdentifiersVisitorOptions} options
 */
export function traceIdentifiersForVariableDeclarationList({node, continuation}: TraceIdentifiersVisitorOptions<VariableDeclarationList>): void {
	for (const declaration of node.declarations) {
		continuation(declaration);
	}
}
