import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {VariableDeclaration} from "typescript";

export function checkVariableDeclaration({node, continuation}: ReferenceVisitorOptions<VariableDeclaration>): boolean {
	if (node.initializer != null && continuation(node.initializer)) return true;
	if (node.type != null && continuation(node.type)) return true;

	return false;
}
