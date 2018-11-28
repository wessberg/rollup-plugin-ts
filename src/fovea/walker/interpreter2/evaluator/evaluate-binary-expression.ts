import {IEvaluatorOptions} from "./i-evaluator-options";
import {BinaryExpression, SyntaxKind} from "typescript";
import {getDotPathFromNode} from "../lexical-environment/get-dot-path-from-node";
import {setInLexicalEnvironment} from "../lexical-environment/lexical-environment";

/**
 * Evaluates, or attempts to evaluate, a BinaryExpression
 * @param {IEvaluatorOptions<BinaryExpression>} options
 */
export function evaluateBinaryExpression ({node, continuation, environment, evaluate}: IEvaluatorOptions<BinaryExpression>): void {
	evaluate(node.left, environment, leftValue => {
		evaluate(node.right, environment, rightValue => {
			const leftIdentifier = getDotPathFromNode(node.left);

			const operator = node.operatorToken.kind;
			switch (operator) {

				case SyntaxKind.AmpersandToken: {
					return continuation(leftValue & rightValue);
				}

				case SyntaxKind.AmpersandAmpersandToken: {
					return continuation(leftValue && rightValue);
				}

				case SyntaxKind.AmpersandEqualsToken:
				case SyntaxKind.CaretEqualsToken:
				case SyntaxKind.BarEqualsToken:
				case SyntaxKind.MinusEqualsToken:
				case SyntaxKind.PlusEqualsToken:
				case SyntaxKind.PercentEqualsToken:
				case SyntaxKind.SlashEqualsToken:
				case SyntaxKind.AsteriskEqualsToken:
				case SyntaxKind.AsteriskAsteriskEqualsToken:
				case SyntaxKind.LessThanLessThanEqualsToken:
				case SyntaxKind.GreaterThanGreaterThanEqualsToken:
				case SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken: {

					// There's nothing in the engine restricting you from applying this kind of arithmetic operation on non-numeric data types
					let computedValue = leftValue;
					switch (operator) {
						case SyntaxKind.AmpersandEqualsToken:
							computedValue &= rightValue;
							break;
						case SyntaxKind.CaretEqualsToken:
							computedValue ^= rightValue;
							break;
						case SyntaxKind.BarEqualsToken:
							computedValue |= rightValue;
							break;
						case SyntaxKind.AsteriskEqualsToken:
							computedValue *= rightValue;
							break;
						case SyntaxKind.AsteriskAsteriskEqualsToken:
							computedValue **= rightValue;
							break;
						case SyntaxKind.LessThanLessThanEqualsToken:
							computedValue <<= rightValue;
							break;
						case SyntaxKind.GreaterThanGreaterThanEqualsToken:
							computedValue >>= rightValue;
							break;
						case SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:
							computedValue >>>= rightValue;
							break;
						case SyntaxKind.MinusEqualsToken:
							computedValue -= rightValue;
							break;
						case SyntaxKind.PlusEqualsToken:
							computedValue += rightValue;
							break;
						case SyntaxKind.PercentEqualsToken:
							computedValue %= rightValue;
							break;
						case SyntaxKind.SlashEqualsToken:
							computedValue /= rightValue;
							break;
					}

					// Update to the left-value within the environment if it exists there and has been updated
					if (leftIdentifier != null) {
						setInLexicalEnvironment(environment, leftIdentifier, computedValue);
					}

					// Place the computed value on the Stack
					return continuation(computedValue);
				}

				case SyntaxKind.AsteriskToken: {
					return continuation(leftValue * rightValue);
				}

				case SyntaxKind.AsteriskAsteriskToken: {
					return continuation(leftValue ** rightValue);
				}

				case SyntaxKind.BarToken: {
					return continuation(leftValue | rightValue);
				}

				case SyntaxKind.BarBarToken: {
					return continuation(leftValue || rightValue);
				}

				case SyntaxKind.CaretToken: {
					return continuation(leftValue ^ rightValue);
				}

				case SyntaxKind.CommaToken: {
					return continuation(rightValue);
				}

				case SyntaxKind.MinusToken:
					return continuation(leftValue - rightValue);

				case SyntaxKind.PlusToken:
					return continuation(leftValue + rightValue);

				case SyntaxKind.PercentToken:
					return continuation(leftValue % rightValue);

				case SyntaxKind.SlashToken:
					return continuation(leftValue / rightValue);

				case SyntaxKind.EqualsToken: {
					// Update to the left-value within the environment if it exists there and has been updated
					if (leftIdentifier != null) {
						setInLexicalEnvironment(environment, leftIdentifier, rightValue);
					}

					return continuation(undefined);
				}

				case SyntaxKind.EqualsEqualsToken: {
					// tslint:disable:triple-equals
					return continuation(leftValue == rightValue);
					// tslint:enable:triple-equals
				}

				case SyntaxKind.EqualsEqualsEqualsToken: {
					return continuation(leftValue === rightValue);
				}

				case SyntaxKind.ExclamationEqualsToken: {
					// tslint:disable:triple-equals
					return continuation(leftValue != rightValue);
					// tslint:enable:triple-equals
				}

				case SyntaxKind.ExclamationEqualsEqualsToken: {
					return continuation(leftValue !== rightValue);
				}

				case SyntaxKind.GreaterThanToken:
					return continuation(leftValue > rightValue);

				case SyntaxKind.GreaterThanEqualsToken:
					return continuation(leftValue >= rightValue);

				case SyntaxKind.LessThanToken:
					return continuation(leftValue < rightValue);

				case SyntaxKind.LessThanEqualsToken:
					return continuation(leftValue <= rightValue);

				case SyntaxKind.InKeyword: {
					return continuation(leftValue in rightValue);
				}

				case SyntaxKind.InstanceOfKeyword: {
					return continuation(leftValue instanceof rightValue);
				}
			}
		});
	});
}