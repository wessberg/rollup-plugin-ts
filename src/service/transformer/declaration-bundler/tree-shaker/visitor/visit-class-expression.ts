import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {ensureHasDeclareModifier} from "../../../declaration-pre-bundler/util/modifier/modifier-util";
import {TS} from "../../../../../type/ts";

export function visitClassExpression({node, continuation, typescript}: TreeShakerVisitorOptions<TS.ClassExpression>): TS.ClassExpression | undefined {
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: typescript.updateClassExpression(
				node,
				ensureHasDeclareModifier(node.modifiers, typescript),
				nameContinuationResult,
				node.typeParameters,
				node.heritageClauses,
				node.members
		  );
}
