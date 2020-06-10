import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitImportClause({node, continuation, typescript}: TreeShakerVisitorOptions<TS.ImportClause>): TS.ImportClause | undefined {
	const namedBindingsContinuationResult = node.namedBindings == null ? undefined : continuation(node.namedBindings);
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);

	const removeNamedBindings = namedBindingsContinuationResult == null;
	const removeName = nameContinuationResult == null;

	if (removeNamedBindings && removeName) {
		return undefined;
	}

	return typescript.updateImportClause(node, removeName ? undefined : node.name, removeNamedBindings ? undefined : namedBindingsContinuationResult, node.isTypeOnly);
}
