import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../../type/ts";

export function visitEnumDeclaration({node, continuation, typescript}: TreeShakerVisitorOptions<TS.EnumDeclaration>): TS.EnumDeclaration | undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: typescript.updateEnumDeclaration(node, node.decorators, node.modifiers, nameContinuationResult, node.members);
}
