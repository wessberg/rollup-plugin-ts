import {TS} from "../../../../../../type/ts";
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given ExportSpecifier.
 */
export function traceIdentifiersForExportSpecifier(_options: TraceIdentifiersVisitorOptions<TS.ExportSpecifier>): void {
	// An ExportSpecifier doesn't produce any local module bindings
}
