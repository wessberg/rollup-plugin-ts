import {IEvaluatorOptions} from "./i-evaluator-options";
import {VariableDeclaration} from "typescript";
import {createLiteral, LiteralResult} from "../../../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a VariableDeclaration
 * @param {IEvaluatorOptions<VariableDeclaration>} options
 * @returns {LiteralResult}
 */
export function evaluateVariableDeclaration ({node, continuation, environment}: IEvaluatorOptions<VariableDeclaration>): LiteralResult {
	const nameResult = continuation(node.name, environment);
	// If the name isn''t statically analyzable, return undefined
	if (nameResult == null) return undefined;

	// Start by binding an undefined value to the name of the variable
	environment[nameResult.value] = createLiteral({value: undefined});

	// Compute the initializer
	const initializerResult = node.initializer == null ? createLiteral({value: undefined}) : continuation(node.initializer, environment);

	// If the initializer isn't statically analyzable, return undefined;
	if (initializerResult == null) return undefined;

	// Bind the value to the identifier for the variable
	environment[nameResult.value] = initializerResult;

	return initializerResult;
}