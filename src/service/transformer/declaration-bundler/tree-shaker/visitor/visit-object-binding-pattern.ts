import {BindingElement, ObjectBindingPattern, updateObjectBindingPattern} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitObjectBindingPattern({node, continuation}: TreeShakerVisitorOptions<ObjectBindingPattern>): ObjectBindingPattern | undefined {
	const filteredObjectBindingElements: BindingElement[] = [];
	for (const objectBindingElement of node.elements) {
		const objectBindingElementContinuationResult = continuation(objectBindingElement);

		if (objectBindingElementContinuationResult != null) {
			filteredObjectBindingElements.push(objectBindingElementContinuationResult);
		}
	}
	if (filteredObjectBindingElements.length < 1) {
		return undefined;
	}

	return updateObjectBindingPattern(node, filteredObjectBindingElements);
}
