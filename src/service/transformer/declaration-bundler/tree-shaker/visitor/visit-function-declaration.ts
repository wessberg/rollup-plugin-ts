import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {ensureHasDeclareModifier} from "../../../declaration-pre-bundler/util/modifier/modifier-util";
import {TS} from "../../../../../type/ts";

export function visitFunctionDeclaration({
	node,
	continuation,
	typescript
}: TreeShakerVisitorOptions<TS.FunctionDeclaration>): TS.FunctionDeclaration | undefined {
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: typescript.updateFunctionDeclaration(
				node,
				node.decorators,
				ensureHasDeclareModifier(node.modifiers, typescript),
				node.asteriskToken,
				nameContinuationResult,
				node.typeParameters,
				node.parameters,
				node.type,
				node.body
		  );
}
