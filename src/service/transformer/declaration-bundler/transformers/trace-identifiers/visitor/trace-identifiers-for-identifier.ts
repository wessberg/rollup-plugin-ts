import type {TS} from "../../../../../../type/ts.js";
import type {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options.js";

/**
 * Deconflicts the given Identifier.
 */
export function traceIdentifiersForIdentifier({node, addIdentifier}: TraceIdentifiersVisitorOptions<TS.Identifier>): void {
	addIdentifier(node.text);
}
