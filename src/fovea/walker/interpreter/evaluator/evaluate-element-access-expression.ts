import {IEvaluatorOptions} from "./i-evaluator-options";
import {ElementAccessExpression} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a ElementAccessExpression
 * @param {IEvaluatorOptions<ElementAccessExpression>} options
 * @returns {Literal}
 */
export function evaluateElementAccessExpression ({node, continuation, environment}: IEvaluatorOptions<ElementAccessExpression>): Literal {
	const expressionResult = continuation.run(node.expression, environment);

	const argumentExpressionResult = continuation.run(node.argumentExpression, environment);

	const member = (expressionResult)[argumentExpressionResult];
	return (
		typeof member === "function"
			? (() => {
				const val = (...args: Literal[]) => member.call(expressionResult, ...args);
				// Produce a proper 'toString()' for that function
				val.toString = () => member.toString();
			})()
			: member
	);
}