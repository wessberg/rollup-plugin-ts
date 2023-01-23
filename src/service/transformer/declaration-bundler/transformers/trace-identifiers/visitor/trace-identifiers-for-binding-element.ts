import type {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options.js";
import type {TS} from "../../../../../../type/ts.js";

/**
 * Deconflicts the given BindingElement.
 */
export function traceIdentifiersForBindingElement({node, continuation}: TraceIdentifiersVisitorOptions<TS.BindingElement>): void {
	return continuation(node.name);
}
