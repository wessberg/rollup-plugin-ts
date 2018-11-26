import {IEvaluatorOptions} from "./i-evaluator-options";
import {NumericLiteral} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a NumericLiteral
 * @param {IEvaluatorOptions<NumericLiteral>} options
 * @returns {Literal}
 */
export function evaluateNumericLiteral ({node}: IEvaluatorOptions<NumericLiteral>): Literal {
	return Number(node.text);
}