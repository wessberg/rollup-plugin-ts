import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";
import {isNodeFactory} from "../../../util/is-node-factory";

export function visitVariableDeclaration({node, continuation, compatFactory}: TreeShakerVisitorOptions<TS.VariableDeclaration>): TS.VariableDeclaration | undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: isNodeFactory(compatFactory)
		? compatFactory.updateVariableDeclaration(node, nameContinuationResult, node.exclamationToken, node.type, node.initializer)
		: compatFactory.updateVariableDeclaration(node, nameContinuationResult, node.type, node.initializer);
}
