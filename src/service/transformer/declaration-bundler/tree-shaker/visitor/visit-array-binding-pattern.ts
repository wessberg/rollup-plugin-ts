import {ArrayBindingElement, ArrayBindingPattern, updateArrayBindingPattern} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitArrayBindingPattern({node, continuation}: TreeShakerVisitorOptions<ArrayBindingPattern>): ArrayBindingPattern | undefined {
	const filteredArrayBindingElements: ArrayBindingElement[] = [];
	for (const arrayBindingElement of node.elements) {
		const arrayBindingElementContinuationResult = continuation(arrayBindingElement);

		if (arrayBindingElementContinuationResult != null) {
			filteredArrayBindingElements.push(arrayBindingElementContinuationResult);
		}
	}
	if (filteredArrayBindingElements.length < 1) {
		return undefined;
	}

	return updateArrayBindingPattern(node, filteredArrayBindingElements);
}
