import {IEvaluatorOptions} from "./i-evaluator-options";
import {BinaryExpression, SyntaxKind} from "typescript";
import {createLiteral, LiteralResult} from "../../../literal/literal";
import {isCallable} from "../../../callable/is-callable";
import {isPrimitiveType, PrimitiveType} from "../../../primitive/primitive";

/**
 * Evaluates, or attempts to evaluate, a BinaryExpression
 * @param {IEvaluatorOptions<BinaryExpression>} options
 * @returns {LiteralResult}
 */
export function evaluateBinaryExpression ({node, continuation, environment}: IEvaluatorOptions<BinaryExpression>): LiteralResult {
	const left = continuation(node.left, environment);
	const right = continuation(node.right, environment);

	// If any of the two sides of the expression couldn't be resolved, return undefined
	if (left == null || right == null) return undefined;

	// Unpack the values
	const leftValue = left.value;
	const rightValue = right.value;
	const operator = node.operatorToken.kind;

	switch (operator) {

		case SyntaxKind.AmpersandToken: {
			// There's nothing in the engine restricting you from applying this kind of arithmetic operation on non-numeric data types
			return createLiteral({value: (<number>leftValue) & (<number>rightValue)});
		}

		case SyntaxKind.AmpersandAmpersandToken: {
			return createLiteral({value: leftValue && rightValue});
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
			// Symbols isn't compatible with these operators
			if (typeof leftValue === "symbol" || typeof rightValue === "symbol") return undefined;

			// There's nothing in the engine restricting you from applying this kind of arithmetic operation on non-numeric data types
			let computedValue = <number>leftValue;
			switch (operator) {
				case SyntaxKind.AmpersandEqualsToken:
					computedValue &= <number>rightValue;
					break;
				case SyntaxKind.CaretEqualsToken:
					computedValue ^= <number>rightValue;
					break;
				case SyntaxKind.BarEqualsToken:
					computedValue |= <number>rightValue;
					break;
				case SyntaxKind.AsteriskEqualsToken:
					computedValue *= <number>rightValue;
					break;
				case SyntaxKind.AsteriskAsteriskEqualsToken:
					computedValue **= <number>rightValue;
					break;
				case SyntaxKind.LessThanLessThanEqualsToken:
					computedValue <<= <number>rightValue;
					break;
				case SyntaxKind.GreaterThanGreaterThanEqualsToken:
					computedValue >>= <number>rightValue;
					break;
				case SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:
					computedValue >>>= <number>rightValue;
					break;
				case SyntaxKind.MinusEqualsToken:
					computedValue -= <number>rightValue;
					break;
				case SyntaxKind.PlusEqualsToken:
					computedValue += <number>rightValue;
					break;
				case SyntaxKind.PercentEqualsToken:
					computedValue %= <number>rightValue;
					break;
				case SyntaxKind.SlashEqualsToken:
					computedValue /= <number>rightValue;
					break;
			}
			return createLiteral({value: computedValue});
		}

		case SyntaxKind.AsteriskToken: {
			// There's nothing in the engine restricting you from applying this kind of arithmetic operation on non-numeric data types
			return createLiteral({value: (<number>leftValue) * (<number>rightValue)});
		}

		case SyntaxKind.AsteriskAsteriskToken: {
			// There's nothing in the engine restricting you from applying this kind of arithmetic operation on non-numeric data types
			return createLiteral({value: (<number>leftValue) ** (<number>rightValue)});
		}

		case SyntaxKind.BarToken: {
			// There's nothing in the engine restricting you from applying this kind of arithmetic operation on non-numeric data types
			return createLiteral({value: (<number>leftValue) | (<number>rightValue)});
		}

		case SyntaxKind.BarBarToken: {
			return createLiteral({value: leftValue || rightValue});
		}

		case SyntaxKind.CaretToken: {
			// There's nothing in the engine restricting you from applying this kind of arithmetic operation on non-numeric data types
			return createLiteral({value: (<number>leftValue) ^ (<number>rightValue)});
		}

		case SyntaxKind.CommaToken: {
			return createLiteral({value: rightValue});
		}

		case SyntaxKind.MinusToken:
		case SyntaxKind.PlusToken:
		case SyntaxKind.PercentToken:
		case SyntaxKind.SlashToken: {
			// Symbols isn't compatible with this operator
			if (typeof leftValue === "symbol" || typeof rightValue === "symbol") return undefined;

			switch (operator) {
				case SyntaxKind.MinusToken:
					// There's nothing in the engine restricting you from applying this kind of arithmetic operation on non-numeric data types
					return createLiteral({value: <number>leftValue - <number>rightValue});

				case SyntaxKind.PlusToken:
					// There's nothing in the engine restricting you from applying this kind of arithmetic operation on non-numeric data types
					return createLiteral({value: <number>leftValue + <number>rightValue});

				case SyntaxKind.PercentToken:
					// There's nothing in the engine restricting you from applying this kind of arithmetic operation on non-numeric data types
					return createLiteral({value: <number>leftValue % <number>rightValue});

				case SyntaxKind.SlashToken:
					// There's nothing in the engine restricting you from applying this kind of arithmetic operation on non-numeric data types
					return createLiteral({value: <number>leftValue / <number>rightValue});

				default:
					// Should never arrive here
					return undefined;
			}
		}

		case SyntaxKind.EqualsToken: {
			return createLiteral({value: leftValue});
		}

		case SyntaxKind.EqualsEqualsToken: {
			// tslint:disable:triple-equals
			return createLiteral({value: leftValue == rightValue});
			// tslint:enable:triple-equals
		}

		case SyntaxKind.EqualsEqualsEqualsToken: {
			return createLiteral({value: leftValue === rightValue});
		}

		case SyntaxKind.ExclamationEqualsToken: {
			// tslint:disable:triple-equals
			return createLiteral({value: leftValue != rightValue});
			// tslint:enable:triple-equals
		}

		case SyntaxKind.ExclamationEqualsEqualsToken: {
			return createLiteral({value: leftValue !== rightValue});
		}

		case SyntaxKind.GreaterThanToken:
		case SyntaxKind.GreaterThanEqualsToken:
		case SyntaxKind.LessThanToken:
		case SyntaxKind.LessThanEqualsToken: {
			// Symbols isn't compatible with this operator
			if (typeof leftValue === "symbol" || typeof rightValue === "symbol") return undefined;

			switch (operator) {
				case SyntaxKind.GreaterThanToken:
					// There's nothing in the engine restricting you from applying this kind of arithmetic operation on non-numeric data types
					return createLiteral({value: <number>leftValue > <number>rightValue});

				case SyntaxKind.GreaterThanEqualsToken:
					// There's nothing in the engine restricting you from applying this kind of arithmetic operation on non-numeric data types
					return createLiteral({value: <number>leftValue >= <number>rightValue});

				case SyntaxKind.LessThanToken:
					// There's nothing in the engine restricting you from applying this kind of arithmetic operation on non-numeric data types
					return createLiteral({value: <number>leftValue < <number>rightValue});

				case SyntaxKind.LessThanEqualsToken:
					// There's nothing in the engine restricting you from applying this kind of arithmetic operation on non-numeric data types
					return createLiteral({value: <number>leftValue <= <number>rightValue});

				default:
					// Fall back to returning undefined. Should never arrive at this clause though
					return undefined;
			}
		}

		case SyntaxKind.InKeyword: {
			// The right-hand side may not be a literal when using the 'in' operator
			if (isPrimitiveType(rightValue)) return undefined;

			return createLiteral({value: <NonNullable<PrimitiveType>>leftValue in rightValue});
		}

		case SyntaxKind.InstanceOfKeyword: {
			// The right-hand side of an 'instanceof' comparison must be callable
			if (!isCallable(rightValue)) return undefined;

			return createLiteral({value: <{}>leftValue instanceof rightValue});
		}

		default:
			// Should never arrive here
			return undefined;
	}
}