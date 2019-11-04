import {ClassDeclaration, updateClassDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitClassDeclaration ({node, continuation}: TreeShakerVisitorOptions<ClassDeclaration>): ClassDeclaration|undefined {
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: updateClassDeclaration(
			node,
			node.decorators,
			node.modifiers,
			nameContinuationResult,
			node.typeParameters,
			node.heritageClauses,
			node.members
		);
}
