import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitVariableDeclaration({
	node,
	continuation,
	typescript
}: TreeShakerVisitorOptions<TS.VariableDeclaration>): TS.VariableDeclaration | undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: typescript.updateVariableDeclaration(node, nameContinuationResult, node.type, node.initializer);
}
