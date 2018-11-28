import {IEvaluatorOptions} from "./i-evaluator-options";
import {isIdentifier, PrefixUnaryExpression, SyntaxKind} from "typescript";
import {getRelevantDictFromLexicalEnvironment} from "../lexical-environment/lexical-environment";

/**
 * Evaluates, or attempts to evaluate, a PrefixUnaryExpression
 * @param {IEvaluatorOptions<PrefixUnaryExpression>} options
 */
export function evaluatePrefixUnaryExpression ({node, continuation, environment, evaluate}: IEvaluatorOptions<PrefixUnaryExpression>): void {
	evaluate(node.operand, environment, operandValue => {
		switch (node.operator) {
			case SyntaxKind.PlusToken: {
				return continuation(+operandValue);
			}

			case SyntaxKind.MinusToken: {
				return continuation(-operandValue);
			}

			case SyntaxKind.TildeToken: {
				return continuation(~operandValue);
			}

			case SyntaxKind.ExclamationToken: {
				return continuation(!operandValue);
			}

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
						return continuation(++dict[node.operand.text]);
					}

					case SyntaxKind.MinusMinusToken: {
						const dict = getRelevantDictFromLexicalEnvironment(environment, node.operand.text)!;
						return continuation(--dict[node.operand.text]);
					}
				}
			}
		}
	});
}