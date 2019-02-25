import {BindingPattern} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Deconflicts the given BindingPattern.
 * @param {TraceIdentifiersVisitorOptions} options
 */
export function traceIdentifiersForBindingPattern({node, continuation}: TraceIdentifiersVisitorOptions<BindingPattern>): void {
	for (const element of node.elements) {
		continuation(element);
	}
}
