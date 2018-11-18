import {IGetLiteralValueOptions} from "./i-get-literal-value-options";
import {LiteralResult} from "../../literal/literal";
import {EvaluatorContinuation} from "./evaluator/evaluator-continuation";
import {evaluateNode} from "./evaluator/evaluate-node";

/**
 * Will get a literal value for the given node. If it doesn't succeed, the value will be 'undefined'
 * @param {IGetLiteralValueOptions} options
 * @returns {LiteralResult}
 */
export function getLiteralValue ({context, node, environment = {}}: IGetLiteralValueOptions): LiteralResult {

	// Prepare a continuation to use
	const continuation: EvaluatorContinuation = (newNode, newEnvironment) => getLiteralValue({context, node: newNode, environment: newEnvironment});
	return evaluateNode({node, continuation, context, environment});

}