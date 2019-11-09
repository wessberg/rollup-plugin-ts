import {TypeAliasDeclaration, updateTypeAliasDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitTypeAliasDeclaration({node, continuation}: TreeShakerVisitorOptions<TypeAliasDeclaration>): TypeAliasDeclaration | undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: updateTypeAliasDeclaration(node, node.decorators, node.modifiers, nameContinuationResult, node.typeParameters, node.type);
}
