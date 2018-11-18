import {IEvaluatorOptions} from "./i-evaluator-options";
import {ReturnStatement} from "typescript";
import {createLiteral, LiteralResult} from "../../../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a ReturnStatement
 * @param {IEvaluatorOptions<ReturnStatement>} options
 * @returns {LiteralResult}
 */
export function evaluateReturnStatement ({node, environment, continuation}: IEvaluatorOptions<ReturnStatement>): LiteralResult {
	if (node.expression == null) return createLiteral({value: undefined});

	return continuation(node.expression, environment);
}