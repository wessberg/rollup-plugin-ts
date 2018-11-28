import {IEvaluatorOptions} from "./i-evaluator-options";
import {ExpressionStatement} from "typescript";

// tslint:disable:strict-boolean-expressions

/**
 * Evaluates, or attempts to evaluate, an ExpressionStatement
 * @param {IEvaluatorOptions<ExpressionStatement>} options
 */
export function evaluateExpressionStatement ({node, continuation, environment, evaluate}: IEvaluatorOptions<ExpressionStatement>): void {
	return evaluate(node.expression, environment, continuation);
}