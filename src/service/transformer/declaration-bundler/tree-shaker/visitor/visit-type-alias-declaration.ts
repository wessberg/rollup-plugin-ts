import {TypeAliasDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitTypeAliasDeclaration ({node, isReferenced}: TreeShakerVisitorOptions<TypeAliasDeclaration>): TypeAliasDeclaration|undefined {
	if (isReferenced(node.name)) {
		return node;
	}
	return undefined;
}
