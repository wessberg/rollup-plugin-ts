import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitVariableStatement({node, continuation, factory}: TreeShakerVisitorOptions<TS.VariableStatement>): TS.VariableStatement | undefined {
	const variableDeclarationListContinuationResult = continuation(node.declarationList);

	if (variableDeclarationListContinuationResult == null) {
		return undefined;
	}

	return factory.updateVariableStatement(node, node.modifiers, variableDeclarationListContinuationResult);
}
