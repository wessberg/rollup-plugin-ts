import {isIdentifier, isNumericLiteral, isRegularExpressionLiteral, isStringLiteralLike, Node, SyntaxKind} from "typescript";
import {EvaluateSimpleLiteralResult} from "./evaluate-simple-literal-result";
import {isBooleanLiteral} from "../../../util/token/is-boolean-literal";

/**
 * This is a tiny function that avoids the costs of building up an evaluation environment
 * for the interpreter. If the node is a simple literal, it will return its' value.
 * @param {Node} node
 * @returns {EvaluateSimpleLiteralResult}
 */
export function evaluateSimpleLiteral (node: Node): EvaluateSimpleLiteralResult {
	if (isStringLiteralLike(node)) return {success: true, value: node.text};
	else if (isBooleanLiteral(node)) return {success: true, value: node.kind === SyntaxKind.TrueKeyword};
	else if (isRegularExpressionLiteral(node)) return {success: true, value: new Function(`return ${node.text}`)()};
	else if (isNumericLiteral(node)) return {success: true, value: Number(node.text)};
	else if (isIdentifier(node) && node.text === "Infinity") return {success: true, value: Infinity};
	else if (isIdentifier(node) && node.text === "NaN") return {success: true, value: NaN};
	else if (isIdentifier(node) && node.text === "null") return {success: true, value: null};
	else if (isIdentifier(node) && node.text === "undefined") return {success: true, value: undefined};
	else return {success: false};
}