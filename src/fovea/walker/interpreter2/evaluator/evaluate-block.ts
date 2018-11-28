import {IEvaluatorOptions} from "./i-evaluator-options";
import {Block} from "typescript";
import {LexicalEnvironment} from "../lexical-environment/lexical-environment";
import {cloneLexicalEnvironment} from "../lexical-environment/clone-lexical-environment";
import {cpsForeach} from "../util/cps/foreach";

/**
 * Evaluates, or attempts to evaluate, a Block
 * @param {IEvaluatorOptions<Block>} options
 */
export function evaluateBlock ({node, environment, continuation, evaluate}: IEvaluatorOptions<Block>): void {
	// Prepare a lexical environment for the Block context
	const localLexicalEnvironment: LexicalEnvironment = cloneLexicalEnvironment(environment);
	cpsForeach(
		node.statements,
		(statement, _, next) => evaluate(statement, localLexicalEnvironment, next),
		continuation
	);
}