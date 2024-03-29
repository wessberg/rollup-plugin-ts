import type {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import type {TS} from "../../../../../../type/ts.js";

export function visitImportDeclaration({node, continuation, factory}: TreeShakerVisitorOptions<TS.ImportDeclaration>): TS.ImportDeclaration | undefined {
	if (node.importClause == null) return undefined;
	const importClauseContinuationResult = continuation(node.importClause);

	if (importClauseContinuationResult == null) {
		return undefined;
	}

	return importClauseContinuationResult === node.importClause
		? node
		: factory.updateImportDeclaration(node, node.modifiers, importClauseContinuationResult, node.moduleSpecifier, node.assertClause);
}
