import {IEvaluatorOptions} from "./i-evaluator-options";
import {NonNullExpression} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a NonNullExpression
 * @param {IEvaluatorOptions<NonNullExpression>} options
 * @returns {Literal}
 */
export function evaluateNonNullExpression ({node, continuation, environment}: IEvaluatorOptions<NonNullExpression>): Literal {
	return continuation.run(node.expression, environment);
}