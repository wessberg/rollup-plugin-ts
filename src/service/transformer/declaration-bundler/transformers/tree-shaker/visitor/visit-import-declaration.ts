import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitImportDeclaration({
	node,
	continuation,
	typescript
}: TreeShakerVisitorOptions<TS.ImportDeclaration>): TS.ImportDeclaration | undefined {
	if (node.importClause == null) return undefined;
	const importClauseContinuationResult = continuation(node.importClause);

	if (importClauseContinuationResult == null) {
		return undefined;
	}

	return importClauseContinuationResult === node.importClause
		? node
		: typescript.updateImportDeclaration(node, node.decorators, node.modifiers, importClauseContinuationResult, node.moduleSpecifier);
}
