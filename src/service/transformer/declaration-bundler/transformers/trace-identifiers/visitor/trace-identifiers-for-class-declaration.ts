import type {TS} from "../../../../../../type/ts.js";
import type {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options.js";

/**
 * Traces identifiers for the given ClassDeclaration.
 */
export function traceIdentifiersForClassDeclaration({node, addIdentifier}: TraceIdentifiersVisitorOptions<TS.ClassDeclaration>): void {
	if (node.name == null) return;
	addIdentifier(node.name.text);
}
