import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitVariableDeclarationList({node, continuation, factory}: TreeShakerVisitorOptions<TS.VariableDeclarationList>): TS.VariableDeclarationList | undefined {
	const filteredVariableDeclarations: TS.VariableDeclaration[] = [];
	for (const variableDeclaration of node.declarations) {
		const variableDeclarationContinuationResult = continuation(variableDeclaration);

		if (variableDeclarationContinuationResult != null) {
			filteredVariableDeclarations.push(variableDeclarationContinuationResult);
		}
	}
	if (filteredVariableDeclarations.length < 1) {
		return undefined;
	}

	return factory.updateVariableDeclarationList(node, filteredVariableDeclarations);
}
