import {IEvaluatorOptions} from "./i-evaluator-options";
import {StringLiteralLike} from "typescript";

/**
 * Evaluates, or attempts to evaluate, a StringLiteralLike
 * @param {IEvaluatorOptions<StringLiteralLike>} options
 */
export function evaluateStringLiteral ({node, continuation}: IEvaluatorOptions<StringLiteralLike>): void {
	return continuation(node.text);
}