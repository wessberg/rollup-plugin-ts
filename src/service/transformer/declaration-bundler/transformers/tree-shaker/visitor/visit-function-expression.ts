import type {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import type {TS} from "../../../../../../type/ts.js";

export function visitFunctionExpression({node, continuation, factory}: TreeShakerVisitorOptions<TS.FunctionExpression>): TS.FunctionExpression | undefined {
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: factory.updateFunctionExpression(node, node.modifiers, node.asteriskToken, nameContinuationResult, node.typeParameters, node.parameters, node.type, node.body);
}
