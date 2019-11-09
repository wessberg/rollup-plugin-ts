import {ModuleDeclaration, updateModuleDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitModuleDeclaration({node, continuation}: TreeShakerVisitorOptions<ModuleDeclaration>): ModuleDeclaration | undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: updateModuleDeclaration(node, node.decorators, node.modifiers, nameContinuationResult, node.body);
}
