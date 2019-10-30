import {isEmptyStatement, VariableStatement} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitVariableStatement({node, continuation}: TreeShakerVisitorOptions<VariableStatement>): VariableStatement | undefined {
	const result = continuation(node);
	return result == null || isEmptyStatement(result.declarationList) || result.declarationList.declarations.length === 0 ? undefined : result;
}
