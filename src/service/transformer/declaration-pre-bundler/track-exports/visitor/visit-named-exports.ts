import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {TS} from "../../../../../type/ts";

/**
 * Visits the given NamedExports.
 */
export function visitNamedExports({node, childContinuation}: TrackExportsVisitorOptions<TS.NamedExports>): TS.NamedExports | undefined {
	return childContinuation(node);
}
