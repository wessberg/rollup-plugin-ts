import {IEvaluatorOptions} from "./i-evaluator-options";
import {ObjectBindingPattern} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, an ObjectBindingPattern
 * @param {IEvaluatorOptions<ObjectBindingPattern>} options
 */
export function evaluateObjectBindingPattern ({node, environment, continuation}: IEvaluatorOptions<ObjectBindingPattern>): Literal {
	let value: Literal;
	for (const declaration of node.elements) {
		value = continuation.run(declaration, environment);
	}
	return value;
}