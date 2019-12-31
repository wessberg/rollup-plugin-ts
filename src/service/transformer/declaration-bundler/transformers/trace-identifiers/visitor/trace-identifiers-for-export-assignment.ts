import {TS} from "../../../../../../type/ts";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given ExportAssignment.
 */
export function traceIdentifiersForExportAssignment({node, continuation}: TraceIdentifiersVisitorOptions<TS.ExportAssignment>): void {
	continuation(node.expression);
}
