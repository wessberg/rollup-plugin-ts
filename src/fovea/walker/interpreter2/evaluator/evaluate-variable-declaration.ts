import {IEvaluatorOptions} from "./i-evaluator-options";
import {VariableDeclaration} from "typescript";
import {Literal} from "../literal/literal";
import {setInLexicalEnvironment} from "../lexical-environment/lexical-environment";

/**
 * Evaluates, or attempts to evaluate, a VariableDeclaration
 * @param {IEvaluatorOptions<VariableDeclaration>} options
 * @returns {Literal}
 */
export function evaluateVariableDeclaration ({node, continuation, environment}: IEvaluatorOptions<VariableDeclaration>): Literal {

	// Compute the initializer
	const initializerResult = node.initializer == null ? undefined : continuation.run(node.initializer, environment);

	// Take the variable name from top of the Stack
	const nameResult = continuation.run(node.name, environment);

	if (nameResult != null) {
		// Bind the value in the existing environment to the identifier for the variable
		setInLexicalEnvironment(environment, nameResult, initializerResult, true);
	}

	// Return the initializer value
	return initializerResult;
}