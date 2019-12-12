import {TS} from "../../../../../../type/ts";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options";

/**
 * Deconflicts the given VariableDeclaration.
 */
export function traceIdentifiersForVariableDeclaration({node, continuation}: TraceIdentifiersVisitorOptions<TS.VariableDeclaration>): void {
	continuation(node.name);
}
