import {IEvaluatorOptions} from "./i-evaluator-options";
import {SyntaxKind, Token} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a BooleanLiteral
 * @param {IEvaluatorOptions<BooleanLiteral>} options
 * @returns {Literal}
 */
export function evaluateBooleanLiteral ({node}: IEvaluatorOptions<Token<SyntaxKind.TrueKeyword|SyntaxKind.FalseKeyword>>): Literal {
	return node.kind === SyntaxKind.TrueKeyword;
}