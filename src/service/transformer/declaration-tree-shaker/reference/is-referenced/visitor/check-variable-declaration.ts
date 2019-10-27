import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {VariableDeclaration} from "typescript";

export function checkVariableDeclaration({node, childContinuation}: ReferenceVisitorOptions<VariableDeclaration>): boolean {
	if (node.initializer != null && childContinuation(node.initializer)) return true;
	if (node.type != null && childContinuation(node.type)) return true;

	return false;
}
