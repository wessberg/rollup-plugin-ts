import {createEmptyStatement, EmptyStatement, ImportClause, isEmptyStatement, updateImportClause} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitImportClause({node, continuation}: TreeShakerVisitorOptions<ImportClause>): ImportClause | EmptyStatement | undefined {
	const result = continuation(node);

	if (result != null && result.namedBindings != null && isEmptyStatement(result.namedBindings)) {
		return result.name == null ? createEmptyStatement() : updateImportClause(node, result.name, undefined);
	}

	return result;
}
