import {createEmptyStatement, EmptyStatement, VariableDeclarationList} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitVariableDeclarationList({
	node,
	continuation
}: TreeShakerVisitorOptions<VariableDeclarationList>): VariableDeclarationList | EmptyStatement {
	const result = continuation(node);
	return result == null || result.declarations.length < 1 ? createEmptyStatement() : result;
}
