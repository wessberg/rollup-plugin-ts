import {TS} from "../../type/ts.js";

/**
 * Returns true if the given Node is a TemplateLiteralTypeNode
 */
export function isTemplateLiteralTypeNode(node: TS.Node, typescript: typeof TS): node is TS.TemplateLiteralTypeNode {
	return typescript.SyntaxKind.TemplateLiteralType != null && node.kind === typescript.SyntaxKind.TemplateLiteralType;
}
