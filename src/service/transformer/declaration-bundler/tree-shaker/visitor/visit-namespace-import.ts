import {createEmptyStatement, EmptyStatement, NamespaceImport} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitNamespaceImport({node, isReferenced}: TreeShakerVisitorOptions<NamespaceImport>): NamespaceImport | EmptyStatement {
	if (isReferenced(node.name)) {
		return node;
	}
	return createEmptyStatement();
}
