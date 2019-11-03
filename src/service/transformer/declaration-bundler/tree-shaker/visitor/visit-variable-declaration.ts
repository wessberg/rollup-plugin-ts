import {VariableDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitVariableDeclaration({node, isReferenced}: TreeShakerVisitorOptions<VariableDeclaration>): VariableDeclaration | undefined {
	if (isReferenced(node.name)) {
		return node;
	}
	return undefined;
}
