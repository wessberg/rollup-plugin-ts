import {IEvaluatorOptions} from "./i-evaluator-options";
import {CallExpression} from "typescript";
import {Literal} from "../literal/literal";
import {getDotPathFromNode} from "../lexical-environment/get-dot-path-from-node";
import {isNonDeterministic} from "../nondeterministic/is-nondeterministic";
import {NonDeterministicError} from "../error/non-deterministic-error/non-deterministic-error";
import {cpsForeach} from "../util/cps/foreach";

/**
 * Evaluates, or attempts to evaluate, a CallExpression
 * @param {IEvaluatorOptions<CallExpression>} options
 */
export function evaluateCallExpression ({node, continuation, environment, deterministic, evaluate}: IEvaluatorOptions<CallExpression>): void {

	// Call the continuation with a new lexical environment. Apply the arguments to it
	evaluate(node.expression, environment, expressionResult => {
		if (deterministic) {
			// Take the 'dot-path' from the node
			const dotPath = getDotPathFromNode(node.expression);

			// Throw if evaluation should only consider expressions that are deterministic (e.g. evaluates to the same value for each invocation, no matter what)
			if (dotPath != null && isNonDeterministic(dotPath, node.arguments) || isNonDeterministic(`${dotPath}()`, node.arguments)) {
				throw new NonDeterministicError();
			}
		}

		const args: Literal[] = [];

		cpsForeach(
			node.arguments,
			(arg, index, next) => {
				evaluate(arg, environment, argResult => {
					args[index] = argResult;
					next();
				});
			},
			() => {
				// If it is a wrapped function, pass the continuation as the first argument
				if (expressionResult.toString() === "[WrappedFunction]") return expressionResult(continuation, ...args);
				// Otherwise, we're having to do with a native function which should be invoked directly
				return continuation(expressionResult(...args));
			}
		);
	});
}