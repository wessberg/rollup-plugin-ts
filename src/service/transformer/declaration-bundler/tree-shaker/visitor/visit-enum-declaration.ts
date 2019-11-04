import {EnumDeclaration, updateEnumDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitEnumDeclaration ({node, continuation}: TreeShakerVisitorOptions<EnumDeclaration>): EnumDeclaration|undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: updateEnumDeclaration(
			node,
			node.decorators,
			node.modifiers,
			nameContinuationResult,
			node.members
		);
}
