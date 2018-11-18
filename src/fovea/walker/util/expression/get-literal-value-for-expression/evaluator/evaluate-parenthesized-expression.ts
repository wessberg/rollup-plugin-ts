import {IEvaluatorOptions} from "./i-evaluator-options";
import {ParenthesizedExpression} from "typescript";
import {createLiteral, LiteralResult} from "../../../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a ParenthesizedExpression
 * @param {IEvaluatorOptions<ParenthesizedExpression>} options
 * @returns {LiteralResult}
 */
export function evaluateParenthesizedExpression ({node, continuation, environment}: IEvaluatorOptions<ParenthesizedExpression>): LiteralResult {
	const expressionResult = continuation(node.expression, environment);
	// If the expression wasn't statically analyzable, return undefined
	if (expressionResult == null) return undefined;

	return createLiteral({value: (expressionResult.value)});
}