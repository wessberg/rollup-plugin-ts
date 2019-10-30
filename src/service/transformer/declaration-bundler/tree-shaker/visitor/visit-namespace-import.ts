import {createEmptyStatement, EmptyStatement, NamespaceImport} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitNamespaceImport({node, continuation}: TreeShakerVisitorOptions<NamespaceImport>): NamespaceImport | EmptyStatement {
	const result = continuation(node);
	return result == null || result.name == null ? createEmptyStatement() : result;
}
