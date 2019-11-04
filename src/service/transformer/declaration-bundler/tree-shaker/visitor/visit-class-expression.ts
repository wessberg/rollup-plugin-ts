import {ClassExpression, updateClassExpression} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitClassExpression ({node, continuation}: TreeShakerVisitorOptions<ClassExpression>): ClassExpression|undefined {
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: updateClassExpression(
			node,
			node.modifiers,
			nameContinuationResult,
			node.typeParameters,
			node.heritageClauses,
			node.members
		);
}
