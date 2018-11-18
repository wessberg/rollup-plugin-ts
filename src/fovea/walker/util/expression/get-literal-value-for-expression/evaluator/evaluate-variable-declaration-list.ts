import {IEvaluatorOptions} from "./i-evaluator-options";
import {VariableDeclarationList} from "typescript";
import {createLiteral, LiteralResult} from "../../../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a VariableDeclarationList
 * @param {IEvaluatorOptions<VariableDeclarationList>} options
 * @returns {LiteralResult}
 */
export function evaluateVariableDeclarationList ({node, environment, continuation}: IEvaluatorOptions<VariableDeclarationList>): LiteralResult {
	for (const declaration of node.declarations) {
		const currentResult = continuation(declaration, environment);
		// If any of the declarations isn't statically analyzable, return undefined
		if (currentResult === undefined) return undefined;
	}
	// The Return value of a VariableDeclarationList is always undefined
	return createLiteral({value: undefined});
}