import {ExportSpecifier} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given ExportSpecifier.
 * @param {TraceIdentifiersVisitorOptions} _options
 */
export function traceIdentifiersForExportSpecifier(_options: TraceIdentifiersVisitorOptions<ExportSpecifier>): void {
	// An ExportSpecifier doesn't produce any local module bindings
}
