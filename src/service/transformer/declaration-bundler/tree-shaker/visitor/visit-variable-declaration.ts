import {updateVariableDeclaration, VariableDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitVariableDeclaration({node, continuation}: TreeShakerVisitorOptions<VariableDeclaration>): VariableDeclaration | undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult ? node : updateVariableDeclaration(node, nameContinuationResult, node.type, node.initializer);
}
