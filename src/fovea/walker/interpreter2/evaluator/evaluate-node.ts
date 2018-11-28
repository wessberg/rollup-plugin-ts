import {isArrayLiteralExpression, isArrowFunction, isAsExpression, isBinaryExpression, isBindingElement, isBlock, isCallExpression, isComputedPropertyName, isElementAccessExpression, isExpressionStatement, isForOfStatement, isFunctionDeclaration, isIdentifier, isIfStatement, isNewExpression, isNonNullExpression, isNumericLiteral, isObjectBindingPattern, isObjectLiteralExpression, isParenthesizedExpression, isPostfixUnaryExpression, isPrefixUnaryExpression, isPropertyAccessExpression, isRegularExpressionLiteral, isReturnStatement, isStringLiteralLike, isSwitchStatement, isTemplateExpression, isTemplateHead, isTemplateMiddle, isTemplateSpan, isTemplateTail, isTypeAssertion, isVariableDeclaration, isVariableDeclarationList, isVariableStatement, Node, SyntaxKind} from "typescript";
import {IEvaluatorOptions} from "./i-evaluator-options";
import {evaluateVariableDeclaration} from "./evaluate-variable-declaration";
import {evaluateBinaryExpression} from "./evaluate-binary-expression";
import {evaluateCallExpression} from "./evaluate-call-expression";
import {evaluateParenthesizedExpression} from "./evaluate-parenthesized-expression";
import {evaluateArrowFunctionExpression} from "./evaluate-arrow-function-expression";
import {evaluateStringLiteral} from "./evaluate-string-literal";
import {evaluateNumericLiteral} from "./evaluate-numeric-literal";
import {evaluateBooleanLiteral} from "./evaluate-boolean-literal";
import {isBooleanLiteral} from "../../util/token/is-boolean-literal";
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
import {evaluateComputedPropertyName} from "./evaluate-computed-property-name";
import {evaluateBindingElement} from "./evaluate-binding-element";
import {evaluateObjectBindingPattern} from "./evaluate-object-binding-pattern";
import {evaluateFunctionDeclaration} from "./evaluate-function-declaration";
import {evaluateIfStatement} from "./evaluate-if-statement";
import {evaluateExpressionStatement} from "./evaluate-expression-statement";
import {evaluateTemplateExpression} from "./evaluate-template-expression";
import {evaluateTemplateSpan} from "./evaluate-template-span";
import {evaluateTemplateHead} from "./evaluate-template-head";
import {evaluateTemplateMiddle} from "./evaluate-template-middle";
import {evaluateTemplateTail} from "./evaluate-template-tail";
import {evaluateTypeAssertion} from "./evaluate-type-assertion-expression";
import {evaluatePostfixUnaryExpression} from "./evaluate-postfix-unary-expression";
import {evaluateNewExpression} from "./evaluate-new-expression";
import {evaluateNonNullExpression} from "./evaluate-non-null-expression";
import {evaluateAsExpression} from "./evaluate-as-expression";
import {evaluateSwitchStatement} from "./evaluate-switch-statement";
import {evaluateForOfStatement} from "./evaluate-for-of-statement";
import {UnexpectedNodeError} from "../error/unexpected-node-error/unexpected-node-error";

/**
 * Will get a literal value for the given Node. If it doesn't succeed, the value will be 'undefined'
 * @param {IEvaluatorOptions<Node>} options
 */
export function evaluateNode ({node, ...rest}: IEvaluatorOptions<Node>): void {
	console.log("evaluateNode:", (() => {
		if (node.kind === SyntaxKind.NumericLiteral) return "NumericLiteral";
		return SyntaxKind[node.kind];
	})(), (() => {
		try {
			return `"${node.getText()}"`;
		} catch {
			return "";
		}
	})());

	if (isIdentifier(node)) {
		evaluateIdentifier({node, ...rest});
	}

	else if (isStringLiteralLike(node)) {
		evaluateStringLiteral({node, ...rest});
	}

	else if (isNumericLiteral(node)) {
		evaluateNumericLiteral({node, ...rest});
	}

	else if (isBooleanLiteral(node)) {
		evaluateBooleanLiteral({node, ...rest});
	}

	else if (isForOfStatement(node)) {
		evaluateForOfStatement({node, ...rest});
	}

	else if (isRegularExpressionLiteral(node)) {
		evaluateRegularExpressionLiteral({node, ...rest});
	}

	else if (isObjectLiteralExpression(node)) {
		evaluateObjectLiteralExpression({node, ...rest});
	}

	else if (isTypeAssertion(node)) {
		evaluateTypeAssertion({node, ...rest});
	}

	else if (isTemplateExpression(node)) {
		evaluateTemplateExpression({node, ...rest});
	}

	else if (isTemplateHead(node)) {
		evaluateTemplateHead({node, ...rest});
	}

	else if (isTemplateMiddle(node)) {
		evaluateTemplateMiddle({node, ...rest});
	}

	else if (isTemplateTail(node)) {
		evaluateTemplateTail({node, ...rest});
	}

	else if (isTemplateSpan(node)) {
		evaluateTemplateSpan({node, ...rest});
	}

	else if (isArrayLiteralExpression(node)) {
		evaluateArrayLiteralExpression({node, ...rest});
	}

	else if (isObjectBindingPattern(node)) {
		evaluateObjectBindingPattern({node, ...rest});
	}

	else if (isPrefixUnaryExpression(node)) {
		evaluatePrefixUnaryExpression({node, ...rest});
	}

	else if (isPostfixUnaryExpression(node)) {
		evaluatePostfixUnaryExpression({node, ...rest});
	}

	else if (isVariableStatement(node)) {
		evaluateVariableStatement({node, ...rest});
	}

	else if (isBindingElement(node)) {
		evaluateBindingElement({node, ...rest});
	}

	else if (isComputedPropertyName(node)) {
		evaluateComputedPropertyName({node, ...rest});
	}

	else if (isVariableDeclarationList(node)) {
		evaluateVariableDeclarationList({node, ...rest});
	}

	else if (isVariableDeclaration(node)) {
		evaluateVariableDeclaration({node, ...rest});
	}

	else if (isBinaryExpression(node)) {
		evaluateBinaryExpression({node, ...rest});
	}

	else if (isParenthesizedExpression(node)) {
		evaluateParenthesizedExpression({node, ...rest});
	}

	else if (isExpressionStatement(node)) {
		evaluateExpressionStatement({node, ...rest});
	}

	else if (isArrowFunction(node)) {
		evaluateArrowFunctionExpression({node, ...rest});
	}

	else if (isFunctionDeclaration(node)) {
		evaluateFunctionDeclaration({node, ...rest});
	}

	else if (isIfStatement(node)) {
		evaluateIfStatement({node, ...rest});
	}

	else if (isPropertyAccessExpression(node)) {
		evaluatePropertyAccessExpression({node, ...rest});
	}

	else if (isElementAccessExpression(node)) {
		evaluateElementAccessExpression({node, ...rest});
	}

	else if (isCallExpression(node)) {
		evaluateCallExpression({node, ...rest});
	}

	else if (isSwitchStatement(node)) {
		evaluateSwitchStatement({node, ...rest});
	}

	else if (isNewExpression(node)) {
		evaluateNewExpression({node, ...rest});
	}

	else if (isNonNullExpression(node)) {
		evaluateNonNullExpression({node, ...rest});
	}

	else if (isAsExpression(node)) {
		evaluateAsExpression({node, ...rest});
	}

	else if (isBlock(node)) {
		evaluateBlock({node, ...rest});
	}

	else if (isReturnStatement(node)) {
		evaluateReturnStatement({node, ...rest});
	}

	throw new UnexpectedNodeError({node});
}