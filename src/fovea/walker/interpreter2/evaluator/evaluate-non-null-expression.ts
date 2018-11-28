import {IEvaluatorOptions} from "./i-evaluator-options";
import {NonNullExpression} from "typescript";

/**
 * Evaluates, or attempts to evaluate, a NonNullExpression
 * @param {IEvaluatorOptions<NonNullExpression>} options
 */
export function evaluateNonNullExpression ({node, continuation, environment, evaluate}: IEvaluatorOptions<NonNullExpression>): void {
	return evaluate(node.expression, environment, continuation);
}