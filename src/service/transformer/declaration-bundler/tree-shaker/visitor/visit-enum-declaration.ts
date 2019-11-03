import {EnumDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitEnumDeclaration ({node, isReferenced}: TreeShakerVisitorOptions<EnumDeclaration>): EnumDeclaration|undefined {
	if (isReferenced(node.name)) {
		return node;
	}
	return undefined;
}
