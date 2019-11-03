import {ModuleDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitModuleDeclaration ({node, isReferenced}: TreeShakerVisitorOptions<ModuleDeclaration>): ModuleDeclaration|undefined {
	if (isReferenced(node.name)) {
		return node;
	}
	return undefined;
}
