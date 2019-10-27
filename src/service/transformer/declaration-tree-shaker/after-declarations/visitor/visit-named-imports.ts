import {createEmptyStatement, EmptyStatement, NamedImports} from "typescript";
import {DeclarationTreeShakerVisitorOptions} from "../declaration-tree-shaker-visitor-options";

export function visitNamedImports({node, continuation}: DeclarationTreeShakerVisitorOptions<NamedImports>): NamedImports | EmptyStatement {
	const result = continuation(node);
	return result == null || result.elements.length < 1 ? createEmptyStatement() : result;
}
