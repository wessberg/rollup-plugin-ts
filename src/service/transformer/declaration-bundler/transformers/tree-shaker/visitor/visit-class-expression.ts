import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";
import {isNodeFactory} from "../../../util/is-node-factory";

export function visitClassExpression({node, continuation, compatFactory}: TreeShakerVisitorOptions<TS.ClassExpression>): TS.ClassExpression | undefined {
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: isNodeFactory(compatFactory)
		? compatFactory.updateClassExpression(node, node.decorators, node.modifiers, nameContinuationResult, node.typeParameters, node.heritageClauses, node.members)
		: compatFactory.updateClassExpression(node, node.modifiers, nameContinuationResult, node.typeParameters, node.heritageClauses, node.members);
}
