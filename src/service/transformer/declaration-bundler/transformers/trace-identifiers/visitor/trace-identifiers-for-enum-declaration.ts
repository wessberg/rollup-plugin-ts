import {TS} from "../../../../../../type/ts";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given EnumDeclaration.
 */
export function traceIdentifiersForEnumDeclaration({node, addIdentifier}: TraceIdentifiersVisitorOptions<TS.EnumDeclaration>): void {
	addIdentifier(node.name.text);
}
