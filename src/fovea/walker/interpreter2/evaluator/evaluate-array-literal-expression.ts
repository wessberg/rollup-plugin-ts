import {IEvaluatorOptions} from "./i-evaluator-options";
import {ArrayLiteralExpression} from "typescript";
import {Literal} from "../literal/literal";
import {cpsForeach} from "../util/cps/foreach";

/**
 * Evaluates, or attempts to evaluate, a ArrayLiteralExpression
 * @param {IEvaluatorOptions<ArrayLiteralExpression>} options
 */
export function evaluateArrayLiteralExpression ({node, continuation, environment, evaluate}: IEvaluatorOptions<ArrayLiteralExpression>): void {
	const value: Literal[] = [];

	cpsForeach(
		node.elements,
		(element, index, next) => {
			evaluate(element, environment, result => {
				value[index] = result;
				next();
			});
		},
		// Return the evaluated Array Literal
		() => continuation(value)
	);
}