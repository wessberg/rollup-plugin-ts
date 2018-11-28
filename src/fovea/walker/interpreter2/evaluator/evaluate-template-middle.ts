import {IEvaluatorOptions} from "./i-evaluator-options";
import {TemplateMiddle} from "typescript";

/**
 * Evaluates, or attempts to evaluate, a TemplateMiddle
 * @param {IEvaluatorOptions<TemplateMiddle>} options
 */
export function evaluateTemplateMiddle ({node, continuation}: IEvaluatorOptions<TemplateMiddle>): void {
	return continuation(node.text);
}