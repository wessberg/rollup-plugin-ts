import {TS} from "../../../../../../type/ts.js";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options.js";

/**
 * Deconflicts the given VariableDeclaration.
 */
export function traceIdentifiersForVariableDeclaration({node, continuation}: TraceIdentifiersVisitorOptions<TS.VariableDeclaration>): void {
	continuation(node.name);
}
