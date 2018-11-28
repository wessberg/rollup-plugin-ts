import {IEvaluatorOptions} from "./i-evaluator-options";
import {ComputedPropertyName} from "typescript";

/**
 * Evaluates, or attempts to evaluate, a ComputedPropertyName
 * @param {IEvaluatorOptions<ComputedPropertyName>} options
 */
export function evaluateComputedPropertyName ({node, continuation, environment, evaluate}: IEvaluatorOptions<ComputedPropertyName>): void {
	return evaluate(node.expression, environment, continuation);
}