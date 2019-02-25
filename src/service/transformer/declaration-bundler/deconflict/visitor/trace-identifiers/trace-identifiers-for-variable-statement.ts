import {VariableStatement} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Deconflicts the given VariableStatement.
 * @param {TraceIdentifiersVisitorOptions} options
 */
export function traceIdentifiersForVariableStatement({node, continuation}: TraceIdentifiersVisitorOptions<VariableStatement>): void {
	continuation(node.declarationList);
}
