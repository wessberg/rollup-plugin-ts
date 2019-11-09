import {NamedExports} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";

/**
 * Visits the given NamedExports.
 * @param {TrackExportsVisitorOptions<NamedExports>} options
 * @returns {NamedExports | undefined}
 */
export function visitNamedExports({node, childContinuation}: TrackExportsVisitorOptions<NamedExports>): NamedExports | undefined {
	return childContinuation(node);
}
