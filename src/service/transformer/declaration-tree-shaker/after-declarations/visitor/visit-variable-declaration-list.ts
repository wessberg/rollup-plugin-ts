import {createEmptyStatement, EmptyStatement, VariableDeclarationList} from "typescript";
import {DeclarationTreeShakerVisitorOptions} from "../declaration-tree-shaker-visitor-options";

export function visitVariableDeclarationList({
	node,
	continuation
}: DeclarationTreeShakerVisitorOptions<VariableDeclarationList>): VariableDeclarationList | EmptyStatement {
	const result = continuation(node);
	return result == null || result.declarations.length < 1 ? createEmptyStatement() : result;
}
