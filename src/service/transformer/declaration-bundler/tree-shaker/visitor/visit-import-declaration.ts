import {ImportDeclaration, isEmptyStatement, updateImportDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitImportDeclaration({node, continuation}: TreeShakerVisitorOptions<ImportDeclaration>): ImportDeclaration | undefined {
	if (node.importClause == null) return undefined;
	const importClauseContinuationResult = continuation(node.importClause);

	if (importClauseContinuationResult == null || isEmptyStatement(importClauseContinuationResult)) {
		return undefined;
	}

	return updateImportDeclaration(
		node,
		node.decorators,
		node.modifiers,
		importClauseContinuationResult,
		node.moduleSpecifier
	);
}
