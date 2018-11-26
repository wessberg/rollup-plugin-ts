import {IEvaluatorOptions} from "./i-evaluator-options";
import {TemplateMiddle} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a TemplateMiddle
 * @param {IEvaluatorOptions<TemplateMiddle>} options
 * @returns {Literal}
 */
export function evaluateTemplateMiddle ({node}: IEvaluatorOptions<TemplateMiddle>): Literal {
	return node.text;
}