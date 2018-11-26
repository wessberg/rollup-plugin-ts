import {IEvaluatorOptions} from "./i-evaluator-options";
import {ExpressionStatement} from "typescript";
import {Literal} from "../literal/literal";

// tslint:disable:strict-boolean-expressions

/**
 * Evaluates, or attempts to evaluate, an ExpressionStatement
 * @param {IEvaluatorOptions<ExpressionStatement>} options
 * @returns {Literal}
 */
export function evaluateExpressionStatement ({node, continuation, environment}: IEvaluatorOptions<ExpressionStatement>): Literal {
	return continuation.run(node.expression, environment);
}