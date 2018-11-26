import {IEvaluatorOptions} from "./i-evaluator-options";
import {TypeAssertion} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a TypeAssertion
 * @param {IEvaluatorOptions<TypeAssertion>} options
 * @returns {Literal}
 */
export function evaluateTypeAssertion ({node, continuation, environment}: IEvaluatorOptions<TypeAssertion>): Literal {
	return continuation.run(node.expression, environment);
}