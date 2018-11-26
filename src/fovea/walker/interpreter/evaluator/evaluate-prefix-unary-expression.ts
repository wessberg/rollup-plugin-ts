import {IEvaluatorOptions} from "./i-evaluator-options";
import {isIdentifier, PrefixUnaryExpression, SyntaxKind} from "typescript";
import {Literal} from "../literal/literal";
import {getRelevantDictFromLexicalEnvironment} from "../lexical-environment/lexical-environment";

/**
 * Evaluates, or attempts to evaluate, a PrefixUnaryExpression
 * @param {IEvaluatorOptions<PrefixUnaryExpression>} options
 * @returns {Literal}
 */
export function evaluatePrefixUnaryExpression ({node, continuation, environment}: IEvaluatorOptions<PrefixUnaryExpression>): Literal {
	const operandValue = continuation.run(node.operand, environment);

	switch (node.operator) {
		case SyntaxKind.PlusToken: {
			return +operandValue;
		}

		case SyntaxKind.MinusToken: {
			return -operandValue;
		}

		case SyntaxKind.TildeToken: {
			return ~operandValue;
		}

		case SyntaxKind.ExclamationToken: {
			return !operandValue;
		}

		case SyntaxKind.PlusPlusToken:
		case SyntaxKind.MinusMinusToken: {
			// If the Operand isn't an identifier, this will be a SyntaxError
			if (!isIdentifier(node.operand)) {
				return;
			}

			// Find the value associated with the identifier within the environment.

			switch (node.operator) {
				case SyntaxKind.PlusPlusToken: {
					const dict = getRelevantDictFromLexicalEnvironment(environment, node.operand.text)!;
					return ++dict[node.operand.text];
				}

				case SyntaxKind.MinusMinusToken: {
					const dict = getRelevantDictFromLexicalEnvironment(environment, node.operand.text)!;
					return --dict[node.operand.text];
				}
			}
		}
	}
}