import {IEvaluatorOptions} from "./i-evaluator-options";
import {NewExpression} from "typescript";
import {cloneLexicalEnvironment} from "../lexical-environment/clone-lexical-environment";
import {Literal} from "../literal/literal";
import {getDotPathFromNode} from "../lexical-environment/get-dot-path-from-node";
import {isNonDeterministic} from "../nondeterministic/is-nondeterministic";
import {EvaluateFailureKind} from "../evaluate-failure";

/**
 * Evaluates, or attempts to evaluate, a NewExpression
 * @param {IEvaluatorOptions<NewExpression>} options
 * @returns {Literal}
 */
export function evaluateNewExpression ({node, continuation, environment, deterministic}: IEvaluatorOptions<NewExpression>): Literal {

	// Call the continuation with a new lexical environment. Apply the arguments to it
	const expressionValue = continuation.run(node.expression, environment);

	if (deterministic) {
		// Take the 'dot-path' from the node
		const dotPath = getDotPathFromNode(node.expression);

		// Throw if evaluation should only consider expressions that are deterministic (e.g. evaluates to the same value for each invocation, no matter what)
		if (dotPath != null && isNonDeterministic(`${dotPath}.constructor`, node.arguments)) {
			throw new Error(EvaluateFailureKind.NONDETERMINISTIC);
		}
	}

	// Prepare a lexical scope just for the arguments
	const localEnvironment = cloneLexicalEnvironment(environment);
	const args: Literal[] = [];

	if (node.arguments != null) {
		for (const arg of node.arguments) {
			args.push(continuation.run(arg, localEnvironment));
		}
	}

	// Invoke the function
	return new expressionValue(...args);
}