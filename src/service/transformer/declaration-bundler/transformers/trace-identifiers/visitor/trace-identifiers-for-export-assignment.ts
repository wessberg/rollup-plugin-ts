import {TS} from "../../../../../../type/ts.js";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options.js";

/**
 * Traces identifiers for the given ExportAssignment.
 */
export function traceIdentifiersForExportAssignment({node, continuation}: TraceIdentifiersVisitorOptions<TS.ExportAssignment>): void {
	continuation(node.expression);
}
