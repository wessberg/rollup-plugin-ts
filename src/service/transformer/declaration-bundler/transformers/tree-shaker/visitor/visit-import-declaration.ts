import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";

export function visitImportDeclaration({node, continuation, factory}: TreeShakerVisitorOptions<TS.ImportDeclaration>): TS.ImportDeclaration | undefined {
	if (node.importClause == null) return undefined;
	const importClauseContinuationResult = continuation(node.importClause);

	if (importClauseContinuationResult == null) {
		return undefined;
	}

	return importClauseContinuationResult === node.importClause
		? node
		: factory.updateImportDeclaration(node, node.decorators, node.modifiers, importClauseContinuationResult, node.moduleSpecifier, node.assertClause);
}
