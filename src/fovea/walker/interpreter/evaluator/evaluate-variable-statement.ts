import {IEvaluatorOptions} from "./i-evaluator-options";
import {VariableStatement} from "typescript";

/**
 * Evaluates, or attempts to evaluate, a VariableStatement
 * @param {IEvaluatorOptions<VariableStatement>} options
 */
export function evaluateVariableStatement ({node, environment, continuation}: IEvaluatorOptions<VariableStatement>): void {
	continuation.run(node.declarationList, environment);
}