import {TS} from "../../../../../../type/ts.js";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options.js";

/**
 * Traces identifiers for the given EnumDeclaration.
 */
export function traceIdentifiersForEnumDeclaration({node, addIdentifier}: TraceIdentifiersVisitorOptions<TS.EnumDeclaration>): void {
	addIdentifier(node.name.text);
}
