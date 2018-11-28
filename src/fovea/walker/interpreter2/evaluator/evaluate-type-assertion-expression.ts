import {IEvaluatorOptions} from "./i-evaluator-options";
import {TypeAssertion} from "typescript";

/**
 * Evaluates, or attempts to evaluate, a TypeAssertion
 * @param {IEvaluatorOptions<TypeAssertion>} options
 */
export function evaluateTypeAssertion ({node, continuation, environment, evaluate}: IEvaluatorOptions<TypeAssertion>): void {
	return evaluate(node.expression, environment, continuation);
}