import {VariableDeclaration} from "typescript";
import {DeclarationTreeShakerVisitorOptions} from "../declaration-tree-shaker-visitor-options";

export function visitVariableDeclaration({
	node,
	continuation
}: DeclarationTreeShakerVisitorOptions<VariableDeclaration>): VariableDeclaration | undefined {
	const result = continuation(node);
	return result == null || result.name == null ? undefined : result;
}
