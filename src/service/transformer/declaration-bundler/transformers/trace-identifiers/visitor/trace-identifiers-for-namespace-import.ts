import {TS} from "../../../../../../type/ts";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given NamespaceImport.
 */
export function traceIdentifiersForNamespaceImport({node, addIdentifier}: TraceIdentifiersVisitorOptions<TS.NamespaceImport>): void {
	if (node.name != null) {
		addIdentifier(node.name.text);
	}
}
