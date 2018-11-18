import {IEvaluatorOptions} from "./i-evaluator-options";
import {ArrayLiteralExpression} from "typescript";
import {createLiteral, LiteralResult} from "../../../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a ArrayLiteralExpression
 * @param {IEvaluatorOptions<ArrayLiteralExpression>} options
 * @returns {LiteralResult}
 */
export function evaluateArrayLiteralExpression ({node, continuation, environment}: IEvaluatorOptions<ArrayLiteralExpression>): LiteralResult {
	const elements = node.elements.map(element => continuation(element, environment));

	// If any of the elements isn't statically analyzable, the whole expressions isn't
	if (elements.some(element => element === undefined)) return undefined;
	return createLiteral({value: elements});
}