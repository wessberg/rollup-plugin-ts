import {FunctionExpression} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitFunctionExpression ({node, isReferenced}: TreeShakerVisitorOptions<FunctionExpression>): FunctionExpression|undefined {
	if (node.name != null && isReferenced(node.name)) {
		return node;
	}
	return undefined;
}
