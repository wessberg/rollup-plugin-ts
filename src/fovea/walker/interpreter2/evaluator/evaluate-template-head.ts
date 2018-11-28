import {IEvaluatorOptions} from "./i-evaluator-options";
import {TemplateHead} from "typescript";

/**
 * Evaluates, or attempts to evaluate, a TemplateHead
 * @param {IEvaluatorOptions<TemplateHead>} options
 */
export function evaluateTemplateHead ({node, continuation}: IEvaluatorOptions<TemplateHead>): void {
	return continuation(node.text);
}