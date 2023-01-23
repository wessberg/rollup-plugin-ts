import type {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import type {TS} from "../../../../../../type/ts.js";

export function visitBindingElement({node, continuation, factory}: TreeShakerVisitorOptions<TS.BindingElement>): TS.BindingElement | undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}

	return node.name === nameContinuationResult ? node : factory.updateBindingElement(node, node.dotDotDotToken, node.propertyName, nameContinuationResult, node.initializer);
}
