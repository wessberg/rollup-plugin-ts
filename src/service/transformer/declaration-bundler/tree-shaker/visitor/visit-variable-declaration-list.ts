import {createEmptyStatement, EmptyStatement, isEmptyStatement, updateVariableDeclarationList, VariableDeclaration, VariableDeclarationList} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitVariableDeclarationList ({
																								node,
																								continuation
																							}: TreeShakerVisitorOptions<VariableDeclarationList>): VariableDeclarationList|EmptyStatement {
	const filteredVariableDeclarations: VariableDeclaration[] = [];
	for (const variableDeclaration of node.declarations) {
		const variableDeclarationContinuationResult = continuation(variableDeclaration);

		if (variableDeclarationContinuationResult != null && !isEmptyStatement(variableDeclarationContinuationResult)) {
			filteredVariableDeclarations.push(variableDeclarationContinuationResult);
		}
	}
	if (filteredVariableDeclarations.length < 1) {
		return createEmptyStatement();
	}

	return updateVariableDeclarationList(
		node,
		filteredVariableDeclarations
	);
}
