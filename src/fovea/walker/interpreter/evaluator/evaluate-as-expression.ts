import {IEvaluatorOptions} from "./i-evaluator-options";
import {AsExpression} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, an AsExpression
 * @param {IEvaluatorOptions<AsExpression>} options
 * @returns {Literal}
 */
export function evaluateAsExpression ({node, continuation, environment}: IEvaluatorOptions<AsExpression>): Literal {
	return continuation.run(node.expression, environment);
}