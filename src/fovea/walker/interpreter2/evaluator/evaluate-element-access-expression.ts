import {IEvaluatorOptions} from "./i-evaluator-options";
import {ElementAccessExpression} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a ElementAccessExpression
 * @param {IEvaluatorOptions<ElementAccessExpression>} options
 */
export function evaluateElementAccessExpression ({node, continuation, environment, evaluate}: IEvaluatorOptions<ElementAccessExpression>): void {
	evaluate(node.expression, environment, expressionResult => {
		evaluate(node.argumentExpression, environment, argumentExpressionResult => {
			const member = (expressionResult)[argumentExpressionResult];
			continuation(
				typeof member === "function"
					? (() => {
						const val = (...args: Literal[]) => member.call(expressionResult, ...args);
						// Produce a proper 'toString()' for that function
						val.toString = () => member.toString();
						return val;
					})()
					: member
			);
		});
	});
}