import {IEvaluatorOptions} from "./i-evaluator-options";
import {SyntaxKind, Token} from "typescript";

/**
 * Evaluates, or attempts to evaluate, a BooleanLiteral
 * @param {IEvaluatorOptions<BooleanLiteral>} options
 */
export function evaluateBooleanLiteral ({node, continuation}: IEvaluatorOptions<Token<SyntaxKind.TrueKeyword|SyntaxKind.FalseKeyword>>): void {
	return continuation(node.kind === SyntaxKind.TrueKeyword);
}