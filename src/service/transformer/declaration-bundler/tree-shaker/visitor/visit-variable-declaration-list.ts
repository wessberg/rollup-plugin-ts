import {updateVariableDeclarationList, VariableDeclaration, VariableDeclarationList} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitVariableDeclarationList({
	node,
	continuation
}: TreeShakerVisitorOptions<VariableDeclarationList>): VariableDeclarationList | undefined {
	const filteredVariableDeclarations: VariableDeclaration[] = [];
	for (const variableDeclaration of node.declarations) {
		const variableDeclarationContinuationResult = continuation(variableDeclaration);

		if (variableDeclarationContinuationResult != null) {
			filteredVariableDeclarations.push(variableDeclarationContinuationResult);
		}
	}
	if (filteredVariableDeclarations.length < 1) {
		return undefined;
	}

	return updateVariableDeclarationList(node, filteredVariableDeclarations);
}
