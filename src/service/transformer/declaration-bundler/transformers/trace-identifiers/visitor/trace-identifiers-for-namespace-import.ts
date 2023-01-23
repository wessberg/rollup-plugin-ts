import type {TS} from "../../../../../../type/ts.js";
import type {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options.js";

/**
 * Traces identifiers for the given NamespaceImport.
 */
export function traceIdentifiersForNamespaceImport({node, addIdentifier}: TraceIdentifiersVisitorOptions<TS.NamespaceImport>): void {
	if (node.name != null) {
		addIdentifier(node.name.text);
	}
}
