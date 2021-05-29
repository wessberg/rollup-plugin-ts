import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitClassExpression({node, continuation, factory}: TreeShakerVisitorOptions<TS.ClassExpression>): TS.ClassExpression | undefined {
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: factory.updateClassExpression(node, node.decorators, node.modifiers, nameContinuationResult, node.typeParameters, node.heritageClauses, node.members);
}
