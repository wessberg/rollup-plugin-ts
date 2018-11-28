import {IEvaluatorOptions} from "./i-evaluator-options";
import {TemplateExpression} from "typescript";
import {cpsMap} from "../util/cps/map";

/**
 * Evaluates, or attempts to evaluate, a TemplateExpression
 * @param {IEvaluatorOptions<TemplateExpression>} options
 */
export function evaluateTemplateExpression ({node, environment, continuation, evaluate}: IEvaluatorOptions<TemplateExpression>): void {
	evaluate(node.head, environment, head => {
		cpsMap(
			node.templateSpans,
			(span, _, next) => evaluate(span, environment, next),
			spans => continuation(`${head}${spans.join("")}`)
		);
	});
}