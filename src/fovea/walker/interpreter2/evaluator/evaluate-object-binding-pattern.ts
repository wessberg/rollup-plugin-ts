import {IEvaluatorOptions} from "./i-evaluator-options";
import {ObjectBindingPattern} from "typescript";
import {Literal} from "../literal/literal";
import {cpsForeach} from "../util/cps/foreach";

/**
 * Evaluates, or attempts to evaluate, an ObjectBindingPattern
 * @param {IEvaluatorOptions<ObjectBindingPattern>} options
 */
export function evaluateObjectBindingPattern ({node, environment, continuation, evaluate}: IEvaluatorOptions<ObjectBindingPattern>): Literal {
	cpsForeach(
		node.elements,
		(declaration, _, next) => evaluate(declaration, environment, next),
		continuation
	);
}