import {IEvaluatorOptions} from "./i-evaluator-options";
import {StringLiteralLike} from "typescript";
import {createLiteral, Literal} from "../../../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a StringLiteralLike
 * @param {IEvaluatorOptions<StringLiteralLike>} options
 * @returns {Literal}
 */
export function evaluateStringLiteral ({node}: IEvaluatorOptions<StringLiteralLike>): Literal {
	return createLiteral({value: node.text});
}