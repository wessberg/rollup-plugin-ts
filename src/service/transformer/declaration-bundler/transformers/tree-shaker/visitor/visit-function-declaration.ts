import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitFunctionDeclaration({node, continuation, compatFactory}: TreeShakerVisitorOptions<TS.FunctionDeclaration>): TS.FunctionDeclaration | undefined {
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: compatFactory.updateFunctionDeclaration(
				node,
				node.decorators,
				node.modifiers,
				node.asteriskToken,
				nameContinuationResult,
				node.typeParameters,
				node.parameters,
				node.type,
				node.body
		  );
}
