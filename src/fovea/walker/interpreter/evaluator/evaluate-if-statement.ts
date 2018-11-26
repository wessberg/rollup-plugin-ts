import {IEvaluatorOptions} from "./i-evaluator-options";
import {IfStatement} from "typescript";
import {Literal} from "../literal/literal";

// tslint:disable:strict-boolean-expressions

/**
 * Evaluates, or attempts to evaluate, an IfStatement
 * @param {IEvaluatorOptions<IfStatement>} options
 * @returns {Literal}
 */
export function evaluateIfStatement ({node, continuation, environment}: IEvaluatorOptions<IfStatement>): Literal {

	// Evaluate the expression part of the IfStatement wil a new lexical environment
	const expressionValue = continuation.run(node.expression, environment);

	// We have to perform a loose boolean expression here to conform with actual spec behavior
	if (expressionValue) {
		// Proceed with the truthy branch
		return continuation.run(node.thenStatement, environment);
	}

	// Proceed with the falsy branch
	else if (node.elseStatement != null) {
		return continuation.run(node.elseStatement, environment);
	}
	// Otherwise return undefined
	return undefined;
}