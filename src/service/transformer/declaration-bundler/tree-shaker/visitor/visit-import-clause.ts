import {ImportClause, updateImportClause} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitImportClause({node, continuation}: TreeShakerVisitorOptions<ImportClause>): ImportClause | undefined {
	const namedBindingsContinuationResult = node.namedBindings == null ? undefined : continuation(node.namedBindings);
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);

	const removeNamedBindings = namedBindingsContinuationResult == null;
	const removeName = nameContinuationResult == null;

	if (removeNamedBindings && removeName) {
		return undefined;
	}

	return updateImportClause(node, removeName ? undefined : node.name, removeNamedBindings ? undefined : namedBindingsContinuationResult);
}
