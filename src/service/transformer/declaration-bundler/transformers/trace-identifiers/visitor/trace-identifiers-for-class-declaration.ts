import {TS} from "../../../../../../type/ts";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given ClassDeclaration.
 */
export function traceIdentifiersForClassDeclaration({node, addIdentifier}: TraceIdentifiersVisitorOptions<TS.ClassDeclaration>): void {
	if (node.name == null) return;
	addIdentifier(node.name.text);
}
