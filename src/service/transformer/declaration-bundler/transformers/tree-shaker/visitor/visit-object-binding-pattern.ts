import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitObjectBindingPattern({node, continuation, typescript}: TreeShakerVisitorOptions<TS.ObjectBindingPattern>): TS.ObjectBindingPattern | undefined {
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

	return typescript.updateObjectBindingPattern(node, filteredObjectBindingElements);
}
