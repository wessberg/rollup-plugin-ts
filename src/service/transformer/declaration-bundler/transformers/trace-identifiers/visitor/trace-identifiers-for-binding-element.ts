import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options";
import {TS} from "../../../../../../type/ts";

/**
 * Deconflicts the given BindingElement.
 */
export function traceIdentifiersForBindingElement({node, continuation}: TraceIdentifiersVisitorOptions<TS.BindingElement>): void {
	return continuation(node.name);
}
