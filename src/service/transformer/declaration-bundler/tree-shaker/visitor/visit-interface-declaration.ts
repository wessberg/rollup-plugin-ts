import {InterfaceDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitInterfaceDeclaration ({node, isReferenced}: TreeShakerVisitorOptions<InterfaceDeclaration>): InterfaceDeclaration|undefined {
	if (isReferenced(node.name)) {
		return node;
	}
	return undefined;
}
