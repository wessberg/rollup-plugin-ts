import {IEvaluatorOptions} from "./i-evaluator-options";
import {IfStatement} from "typescript";

// tslint:disable:strict-boolean-expressions

/**
 * Evaluates, or attempts to evaluate, an IfStatement
 * @param {IEvaluatorOptions<IfStatement>} options
 */
export function evaluateIfStatement ({node, continuation, environment, evaluate}: IEvaluatorOptions<IfStatement>): void {

	// Evaluate the expression part of the IfStatement wil a new lexical environment
	evaluate(node.expression, environment, expressionValue => {
		// We have to perform a loose boolean expression here to conform with actual spec behavior
		if (expressionValue) {
			// Proceed with the truthy branch
			return evaluate(node.thenStatement, environment, continuation);
		}

		// Proceed with the falsy branch
		else if (node.elseStatement != null) {
			return evaluate(node.elseStatement, environment, continuation);
		}
	});
}