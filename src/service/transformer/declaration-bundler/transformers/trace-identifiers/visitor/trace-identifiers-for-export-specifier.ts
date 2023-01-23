import type {TS} from "../../../../../../type/ts.js";
import type {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options.js";

/**
 * Traces identifiers for the given ExportSpecifier.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function traceIdentifiersForExportSpecifier(_options: TraceIdentifiersVisitorOptions<TS.ExportSpecifier>): void {
	// An ExportSpecifier doesn't produce any local module bindings
}
