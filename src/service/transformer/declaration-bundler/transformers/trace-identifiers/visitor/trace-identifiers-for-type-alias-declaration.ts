import {TS} from "../../../../../../type/ts";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given TypeAliasDeclaration.
 */
export function traceIdentifiersForTypeAliasDeclaration({node, addIdentifier}: TraceIdentifiersVisitorOptions<TS.TypeAliasDeclaration>): void {
	if (node.name == null) return;

	addIdentifier(node.name.text);
}
