import {IEvaluatorOptions} from "./i-evaluator-options";
import {ParenthesizedExpression} from "typescript";

/**
 * Evaluates, or attempts to evaluate, a ParenthesizedExpression
 * @param {IEvaluatorOptions<ParenthesizedExpression>} options
 */
export function evaluateParenthesizedExpression ({node, continuation, environment, evaluate}: IEvaluatorOptions<ParenthesizedExpression>): void {
	return evaluate(node.expression, environment, continuation);
}