import {IEvaluatorOptions} from "./i-evaluator-options";
import {AsExpression} from "typescript";

/**
 * Evaluates, or attempts to evaluate, an AsExpression
 * @param {IEvaluatorOptions<AsExpression>} options
 * @returns {void}
 */
export function evaluateAsExpression ({node, continuation, environment, evaluate}: IEvaluatorOptions<AsExpression>): void {
	return evaluate(node.expression, environment, continuation);
}