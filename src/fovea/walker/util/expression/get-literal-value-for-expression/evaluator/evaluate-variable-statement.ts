import {IEvaluatorOptions} from "./i-evaluator-options";
import {VariableStatement} from "typescript";
import {LiteralResult} from "../../../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a VariableStatement
 * @param {IEvaluatorOptions<VariableStatement>} options
 * @returns {LiteralResult}
 */
export function evaluateVariableStatement ({node, environment, continuation}: IEvaluatorOptions<VariableStatement>): LiteralResult {
	return continuation(node.declarationList, environment);
}