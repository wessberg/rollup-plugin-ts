import {FunctionExpression, updateFunctionExpression} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitFunctionExpression ({node, continuation}: TreeShakerVisitorOptions<FunctionExpression>): FunctionExpression|undefined {
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: updateFunctionExpression(
			node,
			node.modifiers,
			node.asteriskToken,
			nameContinuationResult,
			node.typeParameters,
			node.parameters,
			node.type,
			node.body
		);
}
