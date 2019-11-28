import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {ensureHasDeclareModifier} from "../../../declaration-pre-bundler/util/modifier/modifier-util";
import {TS} from "../../../../../type/ts";

export function visitVariableStatement({
	node,
	continuation,
	typescript
}: TreeShakerVisitorOptions<TS.VariableStatement>): TS.VariableStatement | undefined {
	const variableDeclarationListContinuationResult = continuation(node.declarationList);

	if (variableDeclarationListContinuationResult == null) {
		return undefined;
	}

	return typescript.updateVariableStatement(node, ensureHasDeclareModifier(node.modifiers, typescript), variableDeclarationListContinuationResult);
}
