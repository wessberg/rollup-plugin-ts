import {IEvaluatorOptions} from "./i-evaluator-options";
import {Block} from "typescript";
import {LexicalEnvironment} from "../lexical-environment/lexical-environment";
import {cloneLexicalEnvironment} from "../lexical-environment/clone-lexical-environment";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a Block
 * @param {IEvaluatorOptions<Block>} options
 * @returns {Literal}
 */
export function evaluateBlock ({node, environment, continuation}: IEvaluatorOptions<Block>): Literal {
	// Prepare a lexical environment for the Block context
	const localLexicalEnvironment: LexicalEnvironment = cloneLexicalEnvironment(environment);
	return continuation.run(node.statements, localLexicalEnvironment);
}