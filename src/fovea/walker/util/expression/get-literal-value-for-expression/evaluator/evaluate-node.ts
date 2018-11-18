import {isArrayLiteralExpression, isArrowFunction, isBinaryExpression, isBlock, isCallExpression, isElementAccessExpression, isIdentifier, isNumericLiteral, isObjectLiteralExpression, isParenthesizedExpression, isPrefixUnaryExpression, isPropertyAccessExpression, isRegularExpressionLiteral, isReturnStatement, isStringLiteralLike, isVariableDeclaration, isVariableDeclarationList, isVariableStatement, Node, SyntaxKind} from "typescript";
import {IEvaluatorOptions} from "./i-evaluator-options";
import {LiteralResult} from "../../../literal/literal";
import {evaluateVariableDeclaration} from "./evaluate-variable-declaration";
import {evaluateBinaryExpression} from "./evaluate-binary-expression";
import {evaluateCallExpression} from "./evaluate-call-expression";
import {evaluateParenthesizedExpression} from "./evaluate-parenthesized-expression";
import {evaluateArrowFunctionExpression} from "./evaluate-arrow-function-expression";
import {evaluateStringLiteral} from "./evaluate-string-literal";
import {evaluateNumericLiteral} from "./evaluate-numeric-literal";
import {evaluateBooleanLiteral} from "./evaluate-boolean-literal";
import {isBooleanLiteral} from "../../../token/is-boolean-literal";
import {evaluateRegularExpressionLiteral} from "./evaluate-regular-expression-literal";
import {evaluateObjectLiteralExpression} from "./evaluate-object-literal-expression";
import {evaluateArrayLiteralExpression} from "./evaluate-array-literal-expression";
import {evaluateIdentifier} from "./evaluate-identifier";
import {evaluateBlock} from "./evaluate-block";
import {evaluateReturnStatement} from "./evaluate-return-statement";
import {evaluateVariableStatement} from "./evaluate-variable-statement";
import {evaluateVariableDeclarationList} from "./evaluate-variable-declaration-list";
import {evaluatePrefixUnaryExpression} from "./evaluate-prefix-unary-expression";
import {evaluatePropertyAccessExpression} from "./evaluate-property-access-expression";
import {evaluateElementAccessExpression} from "./evaluate-element-access-expression";

/**
 * Will get a literal value for the given Node. If it doesn't succeed, the value will be 'undefined'
 * @param {IEvaluatorOptions<Node>} options
 * @returns {LiteralResult}
 */
export function evaluateNode ({node, continuation, context, environment}: IEvaluatorOptions<Node>): LiteralResult {
	console.log("evaluateNode:", (() => {
		if (node.kind === SyntaxKind.NumericLiteral) return "NumericLiteral";
		return SyntaxKind[node.kind];
	})());

	if (isIdentifier(node)) {
		return evaluateIdentifier({node, continuation, context, environment});
	}

	if (isStringLiteralLike(node)) {
		return evaluateStringLiteral({node, continuation, context, environment});
	}

	else if (isNumericLiteral(node)) {
		return evaluateNumericLiteral({node, continuation, context, environment});
	}

	else if (isBooleanLiteral(node)) {
		return evaluateBooleanLiteral({node, continuation, context, environment});
	}

	else if (isRegularExpressionLiteral(node)) {
		return evaluateRegularExpressionLiteral({node, continuation, context, environment});
	}

	else if (isObjectLiteralExpression(node)) {
		return evaluateObjectLiteralExpression({node, continuation, context, environment});
	}

	else if (isArrayLiteralExpression(node)) {
		return evaluateArrayLiteralExpression({node, continuation, context, environment});
	}

	else if (isPrefixUnaryExpression(node)) {
		return evaluatePrefixUnaryExpression({node, continuation, context, environment});
	}

	else if (isVariableStatement(node)) {
		return evaluateVariableStatement({node, continuation, context, environment});
	}

	else if (isVariableDeclarationList(node)) {
		return evaluateVariableDeclarationList({node, continuation, context, environment});
	}

	else if (isVariableDeclaration(node)) {
		return evaluateVariableDeclaration({node, continuation, context, environment});
	}

	else if (isBinaryExpression(node)) {
		return evaluateBinaryExpression({node, continuation, context, environment});
	}

	else if (isParenthesizedExpression(node)) {
		return evaluateParenthesizedExpression({node, continuation, context, environment});
	}

	else if (isArrowFunction(node)) {
		return evaluateArrowFunctionExpression({node, continuation, context, environment});
	}

	else if (isPropertyAccessExpression(node)) {
		return evaluatePropertyAccessExpression({node, continuation, context, environment});
	}

	else if (isElementAccessExpression(node)) {
		return evaluateElementAccessExpression({node, continuation, context, environment});
	}

	else if (isCallExpression(node)) {
		return evaluateCallExpression({node, continuation, context, environment});
	}

	else if (isBlock(node)) {
		return evaluateBlock({node, continuation, context, environment});
	}

	else if (isReturnStatement(node)) {
		return evaluateReturnStatement({node, continuation, context, environment});
	}

	// Fall back to returning undefined
	return undefined;
}