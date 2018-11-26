import {IEvaluatorOptions} from "./i-evaluator-options";
import {TemplateHead} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a TemplateHead
 * @param {IEvaluatorOptions<TemplateHead>} options
 * @returns {Literal}
 */
export function evaluateTemplateHead ({node}: IEvaluatorOptions<TemplateHead>): Literal {
	return node.text;
}