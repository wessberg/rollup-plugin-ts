import {isArrayLiteralExpression, isArrowFunction, isAsExpression, isBinaryExpression, isBindingElement, isBlock, isCallExpression, isComputedPropertyName, isElementAccessExpression, isExpressionStatement, isForOfStatement, isFunctionDeclaration, isIdentifier, isIfStatement, isNewExpression, isNonNullExpression, isNumericLiteral, isObjectBindingPattern, isObjectLiteralExpression, isParenthesizedExpression, isPostfixUnaryExpression, isPrefixUnaryExpression, isPropertyAccessExpression, isRegularExpressionLiteral, isReturnStatement, isStringLiteralLike, isSwitchStatement, isTemplateExpression, isTemplateHead, isTemplateMiddle, isTemplateSpan, isTemplateTail, isTypeAssertion, isVariableDeclaration, isVariableDeclarationList, isVariableStatement, Node, NodeArray, SyntaxKind} from "typescript";
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
import {Literal} from "../literal/literal";
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
import {evaluateNodeArray} from "./evaluate-node-array";
import {isNodeArray} from "../../util/node-array/is-node-array";
import {evaluateForOfStatement} from "./evaluate-for-of-statement";

/**
 * Will get a literal value for the given Node. If it doesn't succeed, the value will be 'undefined'
 * @param {IEvaluatorOptions<Node>} options
 * @returns {Literal}
 */
export function evaluateNode ({node, ...rest}: IEvaluatorOptions<Node|NodeArray<Node>>): Literal {
	console.log("evaluateNode:", (() => {
		if (isNodeArray(node)) return "NodeArray";
		if (node.kind === SyntaxKind.NumericLiteral) return "NumericLiteral";
		return SyntaxKind[node.kind];
	})(), (() => {
		try {
			if (isNodeArray(node)) return "";
			return `"${node.getText()}"`;
		} catch {
			return "";
		}
	})());

	if (isNodeArray(node)) {
		return evaluateNodeArray({node, ...rest});
	}

	else if (isIdentifier(node)) {
		return evaluateIdentifier({node, ...rest});
	}

	else if (isStringLiteralLike(node)) {
		return evaluateStringLiteral({node, ...rest});
	}

	else if (isNumericLiteral(node)) {
		return evaluateNumericLiteral({node, ...rest});
	}

	else if (isBooleanLiteral(node)) {
		return evaluateBooleanLiteral({node, ...rest});
	}

	else if (isForOfStatement(node)) {
		return evaluateForOfStatement({node, ...rest});
	}

	else if (isRegularExpressionLiteral(node)) {
		return evaluateRegularExpressionLiteral({node, ...rest});
	}

	else if (isObjectLiteralExpression(node)) {
		return evaluateObjectLiteralExpression({node, ...rest});
	}

	else if (isTypeAssertion(node)) {
		return evaluateTypeAssertion({node, ...rest});
	}

	else if (isTemplateExpression(node)) {
		return evaluateTemplateExpression({node, ...rest});
	}

	else if (isTemplateHead(node)) {
		return evaluateTemplateHead({node, ...rest});
	}

	else if (isTemplateMiddle(node)) {
		return evaluateTemplateMiddle({node, ...rest});
	}

	else if (isTemplateTail(node)) {
		return evaluateTemplateTail({node, ...rest});
	}

	else if (isTemplateSpan(node)) {
		return evaluateTemplateSpan({node, ...rest});
	}

	else if (isArrayLiteralExpression(node)) {
		return evaluateArrayLiteralExpression({node, ...rest});
	}

	else if (isObjectBindingPattern(node)) {
		return evaluateObjectBindingPattern({node, ...rest});
	}

	else if (isPrefixUnaryExpression(node)) {
		return evaluatePrefixUnaryExpression({node, ...rest});
	}

	else if (isPostfixUnaryExpression(node)) {
		return evaluatePostfixUnaryExpression({node, ...rest});
	}

	else if (isVariableStatement(node)) {
		return evaluateVariableStatement({node, ...rest});
	}

	else if (isBindingElement(node)) {
		return evaluateBindingElement({node, ...rest});
	}

	else if (isComputedPropertyName(node)) {
		return evaluateComputedPropertyName({node, ...rest});
	}

	else if (isVariableDeclarationList(node)) {
		return evaluateVariableDeclarationList({node, ...rest});
	}

	else if (isVariableDeclaration(node)) {
		return evaluateVariableDeclaration({node, ...rest});
	}

	else if (isBinaryExpression(node)) {
		return evaluateBinaryExpression({node, ...rest});
	}

	else if (isParenthesizedExpression(node)) {
		return evaluateParenthesizedExpression({node, ...rest});
	}

	else if (isExpressionStatement(node)) {
		return evaluateExpressionStatement({node, ...rest});
	}

	else if (isArrowFunction(node)) {
		return evaluateArrowFunctionExpression({node, ...rest});
	}

	else if (isFunctionDeclaration(node)) {
		return evaluateFunctionDeclaration({node, ...rest});
	}

	else if (isIfStatement(node)) {
		return evaluateIfStatement({node, ...rest});
	}

	else if (isPropertyAccessExpression(node)) {
		return evaluatePropertyAccessExpression({node, ...rest});
	}

	else if (isElementAccessExpression(node)) {
		return evaluateElementAccessExpression({node, ...rest});
	}

	else if (isCallExpression(node)) {
		return evaluateCallExpression({node, ...rest});
	}

	else if (isSwitchStatement(node)) {
		return evaluateSwitchStatement({node, ...rest});
	}

	else if (isNewExpression(node)) {
		return evaluateNewExpression({node, ...rest});
	}

	else if (isNonNullExpression(node)) {
		return evaluateNonNullExpression({node, ...rest});
	}

	else if (isAsExpression(node)) {
		return evaluateAsExpression({node, ...rest});
	}

	else if (isBlock(node)) {
		return evaluateBlock({node, ...rest});
	}

	else if (isReturnStatement(node)) {
		return evaluateReturnStatement({node, ...rest});
	}

	// Fall back to returning undefined
	return undefined;
}