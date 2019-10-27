import {ImportDeclaration, isEmptyStatement} from "typescript";
import {DeclarationTreeShakerVisitorOptions} from "../declaration-tree-shaker-visitor-options";

export function visitImportDeclaration({node, continuation}: DeclarationTreeShakerVisitorOptions<ImportDeclaration>): ImportDeclaration | undefined {
	const result = continuation(node);
	return result == null || (result.importClause != null && isEmptyStatement(result.importClause)) ? undefined : result;
}
