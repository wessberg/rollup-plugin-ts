import {IEvaluatorOptions} from "./i-evaluator-options";
import {PropertyAccessExpression} from "typescript";
import {createLiteral, isLiteral, Literal, LiteralResult, takeLiteralValueIfLiteral} from "../../../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a PropertyAccessExpression
 * @param {IEvaluatorOptions<PropertyAccessExpression>} options
 * @returns {LiteralResult}
 */
export function evaluatePropertyAccessExpression ({node, continuation, environment}: IEvaluatorOptions<PropertyAccessExpression>): LiteralResult {
	const expressionResult = continuation(node.expression, environment);
	// If the expression wasn't statically analyzable, return undefined
	if (expressionResult === undefined) return undefined;

	// If the value is null or undefined, it will be a SyntaxError to attempt to access a property on it. Return undefined
	if (expressionResult.value == null) return undefined;

	const memberName = node.name.text;
	const member = (expressionResult.value)[memberName];
	const memberValue = isLiteral(member) ? member.value : member;
	return createLiteral({value: typeof memberValue === "function"
			? (...args: Literal[]) => ({value: takeLiteralValueIfLiteral(memberValue.call(expressionResult.value, ...args))})
			: memberValue
	});
}