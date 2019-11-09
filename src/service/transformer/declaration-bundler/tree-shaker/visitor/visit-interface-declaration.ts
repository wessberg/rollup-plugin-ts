import {InterfaceDeclaration, updateInterfaceDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitInterfaceDeclaration({node, continuation}: TreeShakerVisitorOptions<InterfaceDeclaration>): InterfaceDeclaration | undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: updateInterfaceDeclaration(
				node,
				node.decorators,
				node.modifiers,
				nameContinuationResult,
				node.typeParameters,
				node.heritageClauses,
				node.members
		  );
}
