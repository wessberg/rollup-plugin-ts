import {TS} from "../../../../../../type/ts";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given FunctionDeclaration.
 */
export function traceIdentifiersForFunctionDeclaration({node, addIdentifier}: TraceIdentifiersVisitorOptions<TS.FunctionDeclaration>): void {
	if (node.name == null) return;
	addIdentifier(node.name.text);
}
