import {KeywordTypeNode, SyntaxKind, Node} from "typescript";

/**
 * Returns true if the given Node is a KeywordTypeNode
 * @param {Node} node
 * @returns {node is KeywordTypeNode}
 */
export function isKeywordTypeNode(node: Node): node is KeywordTypeNode {
	switch (node.kind) {
		case SyntaxKind.UnknownKeyword:
		case SyntaxKind.NumberKeyword:
		case SyntaxKind.ObjectKeyword:
		case SyntaxKind.BooleanKeyword:
		case SyntaxKind.StringKeyword:
		case SyntaxKind.SymbolKeyword:
		case SyntaxKind.ThisKeyword:
		case SyntaxKind.VoidKeyword:
		case SyntaxKind.UndefinedKeyword:
		case SyntaxKind.NullKeyword:
		case SyntaxKind.NeverKeyword:
		case SyntaxKind.AnyKeyword:
			return true;
		default:
			return false;
	}
}
