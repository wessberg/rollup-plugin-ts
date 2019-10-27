import {BindingElement} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Deconflicts the given BindingElement.
 * @param {TraceIdentifiersVisitorOptions} options
 */
export function traceIdentifiersForBindingElement({node, continuation}: TraceIdentifiersVisitorOptions<BindingElement>): void {
	return continuation(node.name);
}
