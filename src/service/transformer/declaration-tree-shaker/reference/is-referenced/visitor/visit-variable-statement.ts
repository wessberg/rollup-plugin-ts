import {VariableStatement} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given VariableStatement.
 * @param {VariableStatement} currentNode
 * @param {VisitorOptions} options
 */
export function visitVariableStatement(currentNode: VariableStatement, {continuation}: VisitorOptions): void {
	continuation(currentNode.declarationList);
}
