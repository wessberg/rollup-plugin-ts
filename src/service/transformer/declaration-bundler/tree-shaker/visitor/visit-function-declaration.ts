import {FunctionDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitFunctionDeclaration ({node, isReferenced}: TreeShakerVisitorOptions<FunctionDeclaration>): FunctionDeclaration|undefined {
	if (node.name != null && isReferenced(node.name)) {
		return node;
	}
	return undefined;
}
