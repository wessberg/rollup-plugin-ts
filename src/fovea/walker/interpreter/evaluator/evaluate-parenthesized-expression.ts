import {IEvaluatorOptions} from "./i-evaluator-options";
import {ParenthesizedExpression} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a ParenthesizedExpression
 * @param {IEvaluatorOptions<ParenthesizedExpression>} options
 * @returns {Literal}
 */
export function evaluateParenthesizedExpression ({node, continuation, environment}: IEvaluatorOptions<ParenthesizedExpression>): Literal {
	return continuation.run(node.expression, environment);
}