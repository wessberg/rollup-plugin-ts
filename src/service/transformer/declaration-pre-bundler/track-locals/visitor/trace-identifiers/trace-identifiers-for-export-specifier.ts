import {TrackLocalsVisitorOptions} from "../../track-locals-visitor-options";
import {TS} from "../../../../../../type/ts";

/**
 * Traces identifiers for the given ExportSpecifier.
 */
export function traceIdentifiersForExportSpecifier(_options: TrackLocalsVisitorOptions<TS.ExportSpecifier>): void {
	// An ExportSpecifier doesn't produce any local module bindings
}
