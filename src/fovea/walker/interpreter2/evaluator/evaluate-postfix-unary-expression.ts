import {IEvaluatorOptions} from "./i-evaluator-options";
import {isIdentifier, PostfixUnaryExpression, SyntaxKind} from "typescript";
import {Literal} from "../literal/literal";
import {getRelevantDictFromLexicalEnvironment} from "../lexical-environment/lexical-environment";

/**
 * Evaluates, or attempts to evaluate, a PostfixUnaryExpression
 * @param {IEvaluatorOptions<PostfixUnaryExpression>} options
 * @returns {Literal}
 */
export function evaluatePostfixUnaryExpression ({node, environment, continuation}: IEvaluatorOptions<PostfixUnaryExpression>): Literal {

	switch (node.operator) {

		case SyntaxKind.PlusPlusToken:
		case SyntaxKind.MinusMinusToken: {
			// If the Operand isn't an identifier, this will be a SyntaxError
			if (!isIdentifier(node.operand)) {
				throw new SyntaxError();
			}

			// Find the value associated with the identifier within the environment.

			switch (node.operator) {
				case SyntaxKind.PlusPlusToken: {
					const dict = getRelevantDictFromLexicalEnvironment(environment, node.operand.text)!;
					return continuation(dict[node.operand.text]++);
				}

				case SyntaxKind.MinusMinusToken: {
					const dict = getRelevantDictFromLexicalEnvironment(environment, node.operand.text)!;
					return continuation(dict[node.operand.text]--);
				}
			}
		}
	}
}