import {TS} from "../../../../../../type/ts";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options";

/**
 * Deconflicts the given Identifier.
 */
export function traceIdentifiersForIdentifier({node, addIdentifier}: TraceIdentifiersVisitorOptions<TS.Identifier>): void {
	addIdentifier(node.text);
}
