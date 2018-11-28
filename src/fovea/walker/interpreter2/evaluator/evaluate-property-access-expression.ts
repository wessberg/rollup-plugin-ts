import {IEvaluatorOptions} from "./i-evaluator-options";
import {PropertyAccessExpression} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a PropertyAccessExpression
 * @param {IEvaluatorOptions<PropertyAccessExpression>} options
 */
export function evaluatePropertyAccessExpression ({node, continuation, environment, evaluate}: IEvaluatorOptions<PropertyAccessExpression>): void {

	evaluate(node.expression, environment, expressionResult => {
		const memberName = node.name.text;
		const member = (expressionResult)[memberName];
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
}