import {IEvaluatorOptions} from "./i-evaluator-options";
import {TemplateTail} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a TemplateTail
 * @param {IEvaluatorOptions<TemplateTail>} options
 * @returns {Literal}
 */
export function evaluateTemplateTail ({node}: IEvaluatorOptions<TemplateTail>): Literal {
	return node.text;
}