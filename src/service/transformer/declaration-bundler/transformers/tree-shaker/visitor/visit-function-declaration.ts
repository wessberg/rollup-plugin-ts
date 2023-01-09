import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import { getModifierLikes } from "../../../util/node-util.js";

export function visitFunctionDeclaration({node, continuation, factory}: TreeShakerVisitorOptions<TS.FunctionDeclaration>): TS.FunctionDeclaration | undefined {
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: factory.updateFunctionDeclaration(
				node,
				getModifierLikes(node),
				node.asteriskToken,
				nameContinuationResult,
				node.typeParameters,
				node.parameters,
				node.type,
				node.body
		  );
}
