import {BindingElement, updateBindingElement} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitBindingElement({node, continuation}: TreeShakerVisitorOptions<BindingElement>): BindingElement | undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}

	return node.name === nameContinuationResult
		? node
		: updateBindingElement(node, node.dotDotDotToken, node.propertyName, nameContinuationResult, node.initializer);
}
