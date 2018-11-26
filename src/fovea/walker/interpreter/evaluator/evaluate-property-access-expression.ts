import {IEvaluatorOptions} from "./i-evaluator-options";
import {PropertyAccessExpression} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a PropertyAccessExpression
 * @param {IEvaluatorOptions<PropertyAccessExpression>} options
 * @returns {Literal}
 */
export function evaluatePropertyAccessExpression ({node, continuation, environment}: IEvaluatorOptions<PropertyAccessExpression>): Literal {

	const expressionResult = continuation.run(node.expression, environment);

	const memberName = node.name.text;
	const member = (expressionResult)[memberName];
	return (
		typeof member === "function"
			? (() => {
				const val = (...args: Literal[]) => member.call(expressionResult, ...args);
				// Produce a proper 'toString()' for that function
				val.toString = () => member.toString();
				return val;
			})()
			: member
	);
}