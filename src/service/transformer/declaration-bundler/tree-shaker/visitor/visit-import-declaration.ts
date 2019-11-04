import {ImportDeclaration, updateImportDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitImportDeclaration ({node, continuation}: TreeShakerVisitorOptions<ImportDeclaration>): ImportDeclaration|undefined {
	if (node.importClause == null) return undefined;
	const importClauseContinuationResult = continuation(node.importClause);

	if (importClauseContinuationResult == null) {
		return undefined;
	}

	return importClauseContinuationResult === node.importClause
		? node
		: updateImportDeclaration(
			node,
			node.decorators,
			node.modifiers,
			importClauseContinuationResult,
			node.moduleSpecifier
		);
}
