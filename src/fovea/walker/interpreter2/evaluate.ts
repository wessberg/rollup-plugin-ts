import {IEvaluateOptions} from "./i-evaluate-options";
import {createLexicalEnvironment} from "./lexical-environment/lexical-environment";
import {EvaluateResult} from "./evaluate-result";
import {evaluateSimpleLiteral} from "./evaluator/simple/evaluate-simple-literal";
import {createNodeEvaluator} from "./evaluator/node-evaluator/create-node-evaluator";
import {Literal} from "./literal/literal";

/**
 * Will get a literal value for the given node. If it doesn't succeed, the value will be 'undefined'
 * @param {IEvaluateOptions} options
 * @returns {EvaluateResult}
 */
export function evaluate ({context, node, environment = {}, deterministic = false, maxOps = Infinity}: IEvaluateOptions): EvaluateResult {
	// Take the simple path first. This may be far more performant than building up an environment
	const simpleLiteralResult = evaluateSimpleLiteral(node);
	if (simpleLiteralResult.success) return simpleLiteralResult;

	// Otherwise, build an environment and get to work
	const initialEnvironment = createLexicalEnvironment(environment);
	const nodeEvaluator = createNodeEvaluator({maxOps, deterministic, context});

	let value: Literal;
	try {
		nodeEvaluator(node, initialEnvironment, result => value = result);
		return {
			success: true,
			value
		};
	} catch (reason) {
		return {
			success: false,
			reason
		};
	}
}