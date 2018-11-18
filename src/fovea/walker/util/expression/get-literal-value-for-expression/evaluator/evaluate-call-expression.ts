import {IEvaluatorOptions} from "./i-evaluator-options";
import {CallExpression} from "typescript";
import {Literal, LiteralResult} from "../../../literal/literal";
import {isCallable} from "../../../callable/is-callable";

/**
 * Evaluates, or attempts to evaluate, a CallExpression
 * @param {IEvaluatorOptions<CallExpression>} options
 * @returns {Literal}
 */
export function evaluateCallExpression ({node, continuation, environment}: IEvaluatorOptions<CallExpression>): LiteralResult {
	// Take literal values for the arguments
	const args = node.arguments
		.map(arg => continuation(arg, environment))
		.filter(arg => arg != null)
		.map((arg: NonNullable<Literal>) => arg.value);

	// If some of the arguments couldn't be resolved, it isn't statically analyzable
	if (args.length !== node.arguments.length) return undefined;

	// Call the continuation with a new lexical environment. Apply the arguments to it
	const expressionResult = continuation(node.expression, {...environment});
	// If the expression wasn't statically analyzable, or if it wasn't callable, attempting to call it will be a SyntaxError
	if (expressionResult == null || expressionResult.value == null || !isCallable(expressionResult.value)) return undefined;
	return expressionResult.value(...args);
}