import {TS} from "../../../../../../type/ts";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given ImportClause.
 */
export function traceIdentifiersForImportClause({node, addIdentifier, continuation}: TraceIdentifiersVisitorOptions<TS.ImportClause>): void {
	if (node.name != null) {
		addIdentifier(node.name.text);
	}

	if (node.namedBindings != null) {
		return continuation(node.namedBindings);
	}
}
