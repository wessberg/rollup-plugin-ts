import {IEvaluatorOptions} from "./i-evaluator-options";
import {CallExpression} from "typescript";
import {Literal} from "../literal/literal";
import {getDotPathFromNode} from "../lexical-environment/get-dot-path-from-node";
import {isNonDeterministic} from "../nondeterministic/is-nondeterministic";
import {EvaluateFailureKind} from "../evaluate-failure";

/**
 * Evaluates, or attempts to evaluate, a CallExpression
 * @param {IEvaluatorOptions<CallExpression>} options
 * @returns {Literal}
 */
export function evaluateCallExpression ({node, continuation, environment, deterministic}: IEvaluatorOptions<CallExpression>): Literal {

	// Call the continuation with a new lexical environment. Apply the arguments to it
	const expressionValue = continuation.run(node.expression, environment);

	if (deterministic) {
		// Take the 'dot-path' from the node
		const dotPath = getDotPathFromNode(node.expression);

		// Throw if evaluation should only consider expressions that are deterministic (e.g. evaluates to the same value for each invocation, no matter what)
		if (dotPath != null && isNonDeterministic(dotPath, node.arguments) || isNonDeterministic(`${dotPath}()`, node.arguments)) {
			throw new SyntaxError(EvaluateFailureKind.NONDETERMINISTIC);
		}
	}

	const args: Literal[] = [];

	for (const arg of node.arguments) {
		args.push(continuation.run(arg, environment));
	}

	// Invoke the function
	return expressionValue(...args);
}