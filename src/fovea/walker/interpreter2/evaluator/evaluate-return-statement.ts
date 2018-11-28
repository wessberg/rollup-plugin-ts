import {IEvaluatorOptions} from "./i-evaluator-options";
import {ReturnStatement} from "typescript";

/**
 * Evaluates, or attempts to evaluate, a ReturnStatement
 * @param {IEvaluatorOptions<ReturnStatement>} options
 */
export function evaluateReturnStatement ({node, environment, continuation, evaluate}: IEvaluatorOptions<ReturnStatement>): void {

	// If it is a simple 'return', return undefined
	if (node.expression == null) {
		return continuation(undefined);
	}

	else {
		return evaluate(node.expression, environment, continuation);
	}
}