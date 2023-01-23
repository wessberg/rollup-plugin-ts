import type {TS} from "../../../../../../type/ts.js";
import type {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options.js";

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
