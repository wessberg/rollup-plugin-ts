import {IEvaluatorOptions} from "./i-evaluator-options";
import {StringLiteralLike} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a StringLiteralLike
 * @param {IEvaluatorOptions<StringLiteralLike>} options
 * @returns {Literal}
 */
export function evaluateStringLiteral ({node}: IEvaluatorOptions<StringLiteralLike>): Literal {
	return node.text;
}