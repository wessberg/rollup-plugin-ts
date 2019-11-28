import {TrackLocalsVisitorOptions} from "../../track-locals-visitor-options";
import {TS} from "../../../../../../type/ts";

/**
 * Deconflicts the given BindingElement.
 */
export function traceIdentifiersForBindingElement({node, continuation}: TrackLocalsVisitorOptions<TS.BindingElement>): void {
	return continuation(node.name);
}
