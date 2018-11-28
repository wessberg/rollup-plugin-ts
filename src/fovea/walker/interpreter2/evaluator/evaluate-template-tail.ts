import {IEvaluatorOptions} from "./i-evaluator-options";
import {TemplateTail} from "typescript";

/**
 * Evaluates, or attempts to evaluate, a TemplateTail
 * @param {IEvaluatorOptions<TemplateTail>} options
 */
export function evaluateTemplateTail ({node, continuation}: IEvaluatorOptions<TemplateTail>): void {
	return continuation(node.text);
}