import {IEvaluatorOptions} from "./i-evaluator-options";
import {TemplateExpression} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a TemplateExpression
 * @param {IEvaluatorOptions<TemplateExpression>} options
 * @returns {Literal}
 */
export function evaluateTemplateExpression ({node, environment, continuation}: IEvaluatorOptions<TemplateExpression>): Literal {
	return `${continuation.run(node.head, environment)}${node.templateSpans.map(span => continuation.run(span, environment)).join("")}`;
}