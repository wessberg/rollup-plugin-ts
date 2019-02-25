import {VariableStatement} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given VariableStatement.
 * @param {VariableStatement} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkVariableStatement(currentNode: VariableStatement, {continuation}: ReferenceVisitorOptions): boolean {
	return continuation(currentNode.declarationList);
}
