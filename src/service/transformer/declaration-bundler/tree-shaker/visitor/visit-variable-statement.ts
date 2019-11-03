import {isEmptyStatement, updateVariableStatement, VariableStatement} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {ensureHasDeclareModifier} from "../../../declaration-pre-bundler/util/modifier/modifier-util";

export function visitVariableStatement({node, continuation}: TreeShakerVisitorOptions<VariableStatement>): VariableStatement | undefined {
	const variableDeclarationListContinuationResult = continuation(node.declarationList);

	if (variableDeclarationListContinuationResult == null || isEmptyStatement(variableDeclarationListContinuationResult)) {
		return undefined;
	}

	return updateVariableStatement(
		node,
		ensureHasDeclareModifier(node.modifiers),
		variableDeclarationListContinuationResult
	);
}
