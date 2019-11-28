import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {ensureHasDeclareModifier} from "../../../declaration-pre-bundler/util/modifier/modifier-util";
import {TS} from "../../../../../type/ts";

export function visitFunctionExpression({
	node,
	continuation,
	typescript
}: TreeShakerVisitorOptions<TS.FunctionExpression>): TS.FunctionExpression | undefined {
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: typescript.updateFunctionExpression(
				node,
				ensureHasDeclareModifier(node.modifiers, typescript),
				node.asteriskToken,
				nameContinuationResult,
				node.typeParameters,
				node.parameters,
				node.type,
				node.body
		  );
}
