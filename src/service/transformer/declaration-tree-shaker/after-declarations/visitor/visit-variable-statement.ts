import {isEmptyStatement, VariableStatement} from "typescript";
import {DeclarationTreeShakerVisitorOptions} from "../declaration-tree-shaker-visitor-options";

export function visitVariableStatement({node, continuation}: DeclarationTreeShakerVisitorOptions<VariableStatement>): VariableStatement | undefined {
	const result = continuation(node);
	return result == null || isEmptyStatement(result.declarationList) || result.declarationList.declarations.length === 0 ? undefined : result;
}
