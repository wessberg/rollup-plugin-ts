import {IEvaluatorOptions} from "./i-evaluator-options";
import {TemplateSpan} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a TemplateSpan
 * @param {IEvaluatorOptions<TemplateSpan>} options
 * @returns {Literal}
 */
export function evaluateTemplateSpan ({node, continuation, environment}: IEvaluatorOptions<TemplateSpan>): Literal {
	return `${continuation.run(node.expression, environment)}${continuation.run(node.literal, environment)}`;
}