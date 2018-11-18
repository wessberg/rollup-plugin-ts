import {SyntaxKind, Token} from "typescript";

/**
 * Returns true if the given node is a BooleanLiteral
 * @param {*} node
 * @returns {node is ts.Token<ts.SyntaxKind.TrueKeyword | ts.SyntaxKind.FalseKeyword>}
 */
export function isBooleanLiteral (node: { kind: SyntaxKind }): node is Token<SyntaxKind.TrueKeyword|SyntaxKind.FalseKeyword> {
	return node.kind === SyntaxKind.TrueKeyword || node.kind === SyntaxKind.FalseKeyword;
}