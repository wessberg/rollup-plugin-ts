import {IEvaluatorOptions} from "./i-evaluator-options";
import {ArrayLiteralExpression} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a ArrayLiteralExpression
 * @param {IEvaluatorOptions<ArrayLiteralExpression>} options
 * @returns {Literal}
 */
export function evaluateArrayLiteralExpression ({node, continuation, environment}: IEvaluatorOptions<ArrayLiteralExpression>): Literal {
	const value: Literal[] = [];

	for (let i = 0; i < node.elements.length; i++) {
		value[i] = continuation.run(node.elements[i], environment);
	}

	// Return the evaluated Array Literal
	return value;
}