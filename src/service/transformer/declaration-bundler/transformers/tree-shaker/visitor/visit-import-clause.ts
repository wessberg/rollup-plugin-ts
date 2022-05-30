import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";

export function visitImportClause({node, continuation, factory}: TreeShakerVisitorOptions<TS.ImportClause>): TS.ImportClause | undefined {
	const namedBindingsContinuationResult = node.namedBindings == null ? undefined : continuation(node.namedBindings);
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);

	const removeNamedBindings = namedBindingsContinuationResult == null;
	const removeName = nameContinuationResult == null;

	if (removeNamedBindings && removeName) {
		return undefined;
	}

	return factory.updateImportClause(node, node.isTypeOnly, removeName ? undefined : node.name, removeNamedBindings ? undefined : namedBindingsContinuationResult);
}
