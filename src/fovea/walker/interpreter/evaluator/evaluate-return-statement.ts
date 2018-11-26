import {IEvaluatorOptions} from "./i-evaluator-options";
import {ReturnStatement} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a ReturnStatement
 * @param {IEvaluatorOptions<ReturnStatement>} options
 * @returns {Literal}
 */
export function evaluateReturnStatement ({node, environment, continuation}: IEvaluatorOptions<ReturnStatement>): Literal {

	// If it is a simple 'return', return undefined
	if (node.expression == null) {
		return undefined;
	}

	else {
		return continuation.run(node.expression, environment);
	}
}