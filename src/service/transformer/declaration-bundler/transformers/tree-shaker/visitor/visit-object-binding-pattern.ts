import type {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import type {TS} from "../../../../../../type/ts.js";

export function visitObjectBindingPattern({node, continuation, factory}: TreeShakerVisitorOptions<TS.ObjectBindingPattern>): TS.ObjectBindingPattern | undefined {
	const filteredObjectBindingElements: TS.BindingElement[] = [];
	for (const objectBindingElement of node.elements) {
		const objectBindingElementContinuationResult = continuation(objectBindingElement);

		if (objectBindingElementContinuationResult != null) {
			filteredObjectBindingElements.push(objectBindingElementContinuationResult);
		}
	}
	if (filteredObjectBindingElements.length < 1) {
		return undefined;
	}

	return factory.updateObjectBindingPattern(node, filteredObjectBindingElements);
}
