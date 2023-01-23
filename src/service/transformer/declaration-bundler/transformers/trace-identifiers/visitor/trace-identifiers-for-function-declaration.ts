import type {TS} from "../../../../../../type/ts.js";
import type {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options.js";

/**
 * Traces identifiers for the given FunctionDeclaration.
 */
export function traceIdentifiersForFunctionDeclaration({node, addIdentifier}: TraceIdentifiersVisitorOptions<TS.FunctionDeclaration>): void {
	if (node.name == null) return;
	addIdentifier(node.name.text);
}
