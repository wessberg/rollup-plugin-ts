import {IEvaluatorOptions} from "./i-evaluator-options";
import {isIdentifier, PrefixUnaryExpression, SyntaxKind} from "typescript";
import {createLiteral, LiteralResult} from "../../../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a PrefixUnaryExpression
 * @param {IEvaluatorOptions<PrefixUnaryExpression>} options
 * @returns {LiteralResult}
 */
export function evaluatePrefixUnaryExpression ({node, continuation, environment}: IEvaluatorOptions<PrefixUnaryExpression>): LiteralResult {
	const operandResult = continuation(node.operand, environment);
	// If the operand isn't a literal, it isn't statically analyzable
	if (operandResult == null) return undefined;

	switch (node.operator) {
		case SyntaxKind.PlusToken: {
			return createLiteral({value: +operandResult.value});
		}

		case SyntaxKind.MinusToken: {
			return createLiteral({value: -operandResult.value});
		}

		case SyntaxKind.TildeToken: {
			return createLiteral({value: ~operandResult.value});
		}

		case SyntaxKind.ExclamationToken: {
			return createLiteral({value: !operandResult.value});
		}

		case SyntaxKind.PlusPlusToken:
		case SyntaxKind.MinusMinusToken: {
			// If the Operand isn't an identifier, this will be a SyntaxError
			if (!isIdentifier(node.operand)) {
				return undefined;
			}

			// Find the value associated with the identifier within the environment
			const closureMatch = environment[node.operand.text];
			// If the identifier couldn't be found within the environment, it isn't statically analyzable.
			// And, if it isn't a number or a BigInt, it will be a SyntaxError
			if (closureMatch == null || (typeof closureMatch.value !== "number" && typeof closureMatch.value !== <"number">"bigint")) {
				return undefined;
			}

			switch (node.operator) {
				case SyntaxKind.PlusPlusToken:
					return createLiteral({
						value: ++closureMatch.value
					});

				case SyntaxKind.MinusMinusToken:
					return createLiteral({
						value: --closureMatch.value
					});
			}
		}
	}

	// Fall back to returning undefined
	return undefined;
}