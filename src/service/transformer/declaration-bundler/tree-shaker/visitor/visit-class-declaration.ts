import {ClassDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitClassDeclaration ({node, isReferenced}: TreeShakerVisitorOptions<ClassDeclaration>): ClassDeclaration|undefined {
	if (node.name != null && isReferenced(node.name)) {
		return node;
	}
	return undefined;
}
