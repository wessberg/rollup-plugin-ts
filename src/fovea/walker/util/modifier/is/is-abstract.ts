import {Node, SyntaxKind} from "typescript";
import {hasModifier} from "../has/has-modifier";

/**
 * Returns true if the given Node has the 'abstract' modifier
 * @param {Node} node
 * @returns {boolean}
 */
export function isAbstract (node: Node): boolean {
	return hasModifier(node, SyntaxKind.AbstractKeyword);
}