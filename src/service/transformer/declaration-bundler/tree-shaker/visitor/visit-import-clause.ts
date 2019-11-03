import {createEmptyStatement, EmptyStatement, ImportClause, isEmptyStatement, updateImportClause} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitImportClause({node, continuation}: TreeShakerVisitorOptions<ImportClause>): ImportClause | EmptyStatement | undefined {
	const namedBindingsContinuationResult = node.namedBindings == null ? undefined : continuation(node.namedBindings);
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);

	const removeNamedBindings = namedBindingsContinuationResult == null || isEmptyStatement(namedBindingsContinuationResult);
	const removeName = nameContinuationResult == null || isEmptyStatement(nameContinuationResult);

	if (removeNamedBindings && removeName) return createEmptyStatement();

	return updateImportClause(
		node,
		removeName ? undefined : node.name,
		removeNamedBindings ? undefined : namedBindingsContinuationResult
	);


}
