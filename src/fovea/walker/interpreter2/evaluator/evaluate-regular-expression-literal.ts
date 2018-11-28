import {IEvaluatorOptions} from "./i-evaluator-options";
import {RegularExpressionLiteral} from "typescript";

/**
 * Evaluates, or attempts to evaluate, a RegularExpressionLiteral
 * @param {IEvaluatorOptions<RegularExpressionLiteral>} options
 */
export function evaluateRegularExpressionLiteral ({node, continuation}: IEvaluatorOptions<RegularExpressionLiteral>): void {
	return continuation(new Function(`return ${node.text}`)());
}