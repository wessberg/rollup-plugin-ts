import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitBindingElement({node, continuation, compatFactory}: TreeShakerVisitorOptions<TS.BindingElement>): TS.BindingElement | undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}

	return node.name === nameContinuationResult ? node : compatFactory.updateBindingElement(node, node.dotDotDotToken, node.propertyName, nameContinuationResult, node.initializer);
}
