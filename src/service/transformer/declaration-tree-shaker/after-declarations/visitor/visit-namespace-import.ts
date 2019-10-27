import {createEmptyStatement, EmptyStatement, NamespaceImport} from "typescript";
import {DeclarationTreeShakerVisitorOptions} from "../declaration-tree-shaker-visitor-options";

export function visitNamespaceImport({node, continuation}: DeclarationTreeShakerVisitorOptions<NamespaceImport>): NamespaceImport | EmptyStatement {
	const result = continuation(node);
	return result == null || result.name == null ? createEmptyStatement() : result;
}
