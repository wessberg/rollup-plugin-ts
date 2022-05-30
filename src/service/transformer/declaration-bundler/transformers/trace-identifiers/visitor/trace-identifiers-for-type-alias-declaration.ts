import {TS} from "../../../../../../type/ts.js";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options.js";

/**
 * Traces identifiers for the given TypeAliasDeclaration.
 */
export function traceIdentifiersForTypeAliasDeclaration({node, addIdentifier}: TraceIdentifiersVisitorOptions<TS.TypeAliasDeclaration>): void {
	if (node.name == null) return;

	addIdentifier(node.name.text);
}
