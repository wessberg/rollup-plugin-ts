import {ImportDeclaration, isEmptyStatement} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitImportDeclaration({node, continuation}: TreeShakerVisitorOptions<ImportDeclaration>): ImportDeclaration | undefined {
	const result = continuation(node);
	return result == null || (result.importClause != null && isEmptyStatement(result.importClause)) ? undefined : result;
}
