import {IEvaluatorOptions} from "./i-evaluator-options";
import {VariableDeclarationList} from "typescript";
import {cpsForeach} from "../util/cps/foreach";

/**
 * Evaluates, or attempts to evaluate, a VariableDeclarationList
 * @param {IEvaluatorOptions<VariableDeclarationList>} options
 */
export function evaluateVariableDeclarationList ({node, environment, evaluate, continuation}: IEvaluatorOptions<VariableDeclarationList>): void {
	for (const declaration of node.declarations) {
		continuation.run(declaration, environment);
	}
}