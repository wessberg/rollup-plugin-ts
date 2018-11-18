import {IEvaluatorOptions} from "./i-evaluator-options";
import {Block} from "typescript";
import {LiteralResult} from "../../../literal/literal";
import {LexicalEnvironment} from "../../../lexical-environment/lexical-environment";
import {cloneLexicalEnvironment} from "../../../lexical-environment/clone-lexical-environment";

/**
 * Evaluates, or attempts to evaluate, a Block
 * @param {IEvaluatorOptions<Block>} options
 * @returns {LiteralResult}
 */
export function evaluateBlock ({node, environment, continuation}: IEvaluatorOptions<Block>): LiteralResult {
	// Prepare a lexical environment for the function context
	const localLexicalEnvironment: LexicalEnvironment = cloneLexicalEnvironment({...environment});

	let literalResult: LiteralResult;
	for (const statement of node.statements) {
		literalResult = continuation(statement, localLexicalEnvironment);
		// If any of the results are undefined, the Block isn't statically analyzable
		if (literalResult === undefined) return undefined;
	}

	return literalResult;
}