import {FunctionDeclaration, updateFunctionDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {ensureHasDeclareModifier} from "../../../declaration-pre-bundler/util/modifier/modifier-util";

export function visitFunctionDeclaration({node, continuation}: TreeShakerVisitorOptions<FunctionDeclaration>): FunctionDeclaration | undefined {
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: updateFunctionDeclaration(
				node,
				node.decorators,
				ensureHasDeclareModifier(node.modifiers),
				node.asteriskToken,
				nameContinuationResult,
				node.typeParameters,
				node.parameters,
				node.type,
				node.body
		  );
}
