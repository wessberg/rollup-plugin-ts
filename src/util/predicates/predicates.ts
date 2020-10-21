import {TS} from "../../type/ts";

/**
 * Returns true if the given Node is a TemplateLiteralTypeNode
 */
export function isTemplateLiteralTypeNode(node: TS.Node, typescript: typeof TS): node is TS.TemplateLiteralTypeNode {
	return typescript.SyntaxKind.TemplateLiteralType != null && node.kind === typescript.SyntaxKind.TemplateLiteralType;
}
