import {IEvaluatorOptions} from "./i-evaluator-options";
import {ElementAccessExpression} from "typescript";
import {createLiteral, isLiteral, Literal, LiteralResult, takeLiteralValueIfLiteral} from "../../../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a ElementAccessExpression
 * @param {IEvaluatorOptions<ElementAccessExpression>} options
 * @returns {LiteralResult}
 */
export function evaluateElementAccessExpression ({node, continuation, environment}: IEvaluatorOptions<ElementAccessExpression>): LiteralResult {
	const expressionResult = continuation(node.expression, environment);
	const argumentExpressionResult = continuation(node.argumentExpression, environment);

	// If the expression or argumentExpression wasn't statically analyzable, return undefined
	if (expressionResult === undefined || argumentExpressionResult === undefined) return undefined;

	// If the expression value is null or undefined, it will be a SyntaxError to attempt to access something on it. Return undefined
	if (expressionResult.value == null) return undefined;
	const member = (expressionResult.value)[argumentExpressionResult.value];
	const memberValue = isLiteral(member) ? member.value : member;

	return createLiteral({value: typeof memberValue === "function"
			? (...args: Literal[]) => ({value: takeLiteralValueIfLiteral(memberValue.call(expressionResult.value, ...args))})
			: memberValue
	});
}