import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";

/**
 * Deconflicts the given BindingElement.
 */
export function traceIdentifiersForBindingElement({node, continuation}: TraceIdentifiersVisitorOptions<TS.BindingElement>): void {
	return continuation(node.name);
}
