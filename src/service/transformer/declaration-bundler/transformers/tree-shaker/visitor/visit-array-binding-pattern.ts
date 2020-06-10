import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitArrayBindingPattern({node, continuation, typescript}: TreeShakerVisitorOptions<TS.ArrayBindingPattern>): TS.ArrayBindingPattern | undefined {
	const filteredArrayBindingElements: TS.ArrayBindingElement[] = [];
	for (const arrayBindingElement of node.elements) {
		const arrayBindingElementContinuationResult = continuation(arrayBindingElement);

		if (arrayBindingElementContinuationResult != null) {
			filteredArrayBindingElements.push(arrayBindingElementContinuationResult);
		}
	}
	if (filteredArrayBindingElements.length < 1) {
		return undefined;
	}

	return typescript.updateArrayBindingPattern(node, filteredArrayBindingElements);
}
