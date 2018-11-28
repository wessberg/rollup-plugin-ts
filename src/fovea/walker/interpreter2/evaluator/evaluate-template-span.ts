import {IEvaluatorOptions} from "./i-evaluator-options";
import {TemplateSpan} from "typescript";

/**
 * Evaluates, or attempts to evaluate, a TemplateSpan
 * @param {IEvaluatorOptions<TemplateSpan>} options
 */
export function evaluateTemplateSpan ({node, continuation, environment, evaluate}: IEvaluatorOptions<TemplateSpan>): void {
	evaluate(node.expression, environment, expression => {
		evaluate(node.literal, environment, literal => {
			return continuation(`${expression}${literal}`);
		});
	});
}