import {createEmptyStatement, EmptyStatement, NamedImports} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitNamedImports({node, continuation}: TreeShakerVisitorOptions<NamedImports>): NamedImports | EmptyStatement {
	const result = continuation(node);
	return result == null || result.elements.length < 1 ? createEmptyStatement() : result;
}
