import {IEvaluateOptions} from "./i-evaluate-options";
import {createLexicalEnvironment} from "./lexical-environment/lexical-environment";
import {EvaluateResult} from "./evaluate-result";
import {EvaluateFailureKind} from "./evaluate-failure";
import {createContinuationFactory} from "./evaluator/continuation-function";
import {evaluateSimpleLiteral} from "./evaluator/simple/evaluate-simple-literal";

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
	const continuationFactory = createContinuationFactory({context, initialEnvironment, deterministic, maxOps});
	const continuation = continuationFactory.create();

	try {
		return {
			success: true,
			value: continuation.run(node, initialEnvironment)
		};
	} catch (error) {
		console.log(error);

		switch (error.message) {

			case EvaluateFailureKind.MAX_OPS_EXCEEDED:
				return {
					success: false,
					reason: {
						kind: EvaluateFailureKind.MAX_OPS_EXCEEDED
					}
				};

			default:
				return {
					success: false,
					reason: {
						kind: EvaluateFailureKind.DID_THROW,
						error
					}
				};
		}
	}
}