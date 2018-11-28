import {IEvaluatorOptions} from "./i-evaluator-options";
import {ForOfStatement} from "typescript";
import {Literal} from "../literal/literal";
import {cloneLexicalEnvironment} from "../lexical-environment/clone-lexical-environment";
import {setInLexicalEnvironment} from "../lexical-environment/lexical-environment";
import {IsAsyncError} from "../error/is-async-error/is-async-error";
import {ContinuationFlag} from "../continuation/continuation";

/**
 * Evaluates, or attempts to evaluate, a ForOfStatement
 * @param {IEvaluatorOptions<ForOfStatement>} options
 */
export function evaluateForOfStatement ({node, continuation, environment, evaluate}: IEvaluatorOptions<ForOfStatement>): void {
	// Throw if it is an async iterator
	if (node.awaitModifier != null) {
		throw new IsAsyncError();
	}

	// Compute the 'of' part
	evaluate(node.expression, environment, (expressionResult: Iterable<Literal>) => {
		// Prepare a lexical environment for the ForOfStatement
		const localEnvironment = cloneLexicalEnvironment(environment);

		// Take all keys that existed in the environment before executing the initializer function
		const preInitializerKeys = new Set(Object.keys(localEnvironment.env));

		// Run the initializer to potentially assign any initialized values to the environment
		evaluate(node.initializer, localEnvironment, () => {
			// Take all keys that now in the environment
			const postInitializerKeys = Object.keys(localEnvironment.env);
			// Take the first new key (one that didn't exist before, but does now)
			const [newKey] = postInitializerKeys.filter(postInitializerKey => !preInitializerKeys.has(postInitializerKey));

			// Take an iterator for the expression result
			const expressionIterator = expressionResult[Symbol.iterator]();

			(function recurse () {
				const {value, done} = expressionIterator.next();
				if (!done) {
					// Update the binding in the lexical environment
					setInLexicalEnvironment(localEnvironment, newKey, value);

					evaluate(node.statement, localEnvironment, (evaluatedValue, flag) => {
						if (flag === ContinuationFlag.CONTINUE) return recurse();
						else if (flag === ContinuationFlag.BREAK) return;
						else continuation(evaluatedValue);
					});
				}
			})();
		});
	});

}