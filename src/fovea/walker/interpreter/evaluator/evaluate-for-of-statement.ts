import {IEvaluatorOptions} from "./i-evaluator-options";
import {ForOfStatement, isBreakStatement, isContinueStatement, isReturnStatement} from "typescript";
import {Literal} from "../literal/literal";
import {EvaluateFailureKind} from "../evaluate-failure";
import {cloneLexicalEnvironment} from "../lexical-environment/clone-lexical-environment";
import {setInLexicalEnvironment} from "../lexical-environment/lexical-environment";
import {isNodeArray} from "../../util/node-array/is-node-array";

/**
 * Evaluates, or attempts to evaluate, a ForOfStatement
 * @param {IEvaluatorOptions<ForOfStatement>} options
 * @returns {Literal}
 */
export function evaluateForOfStatement ({node, continuation, continuationFactory, environment}: IEvaluatorOptions<ForOfStatement>): Literal {
	// Throw if it is an async iterator
	if (node.awaitModifier != null) {
		throw new Error(EvaluateFailureKind.IS_ASYNC);
	}

	// Compute the 'of' part
	const expressionResult = <Iterable<Literal>>continuation.run(node.expression, environment);

	// Prepare a lexical environment for the ForOfStatement
	const localEnvironment = cloneLexicalEnvironment(environment);

	// Take all keys that existed in the environment before executing the initializer function
	const preInitializerKeys = new Set(Object.keys(localEnvironment.env));

	// Run the initializer to potentially assign any initialized values to the environment
	continuation.run(node.initializer, localEnvironment);

	// Take all keys that now in the environment
	const postInitializerKeys = Object.keys(localEnvironment.env);
	// Take the first new key (one that didn't exist before, but does now)
	const [newKey] = postInitializerKeys.filter(postInitializerKey => !preInitializerKeys.has(postInitializerKey));

	// Take an iterator for the expression result
	const expressionIterator = expressionResult[Symbol.iterator]();

	let lastValue: Literal;
	while (true) {
		const {value, done} = expressionIterator.next();
		if (done) return lastValue;
		let hasDiscoveredBreak: boolean = false;
		let hasDiscoveredReturn: boolean = false;

		const currentIterationContinuation = continuationFactory.create(currentNode => {
			if (isNodeArray(currentNode)) return false;
			if (isContinueStatement(currentNode)) {
				return true;
			}

			else if (isBreakStatement(currentNode)) {
				hasDiscoveredBreak = true;
				return true;
			}

			else if (isReturnStatement(currentNode)) {
				hasDiscoveredReturn = true;
				return true;
			}
			return false;
		});

		// Update the binding in the lexical environment
		setInLexicalEnvironment(localEnvironment, newKey, value);
		lastValue = currentIterationContinuation.run(node.statement, localEnvironment);
		if (hasDiscoveredBreak || hasDiscoveredReturn) return lastValue;
	}

}