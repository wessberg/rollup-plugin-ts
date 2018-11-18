import {Modifier, Node} from "typescript";

/**
 * Returns true if the given Node has the given kind of Modifier
 * @param {Node|Modifier[]} node
 * @param {Modifier["kind"]} modifier
 * @returns {boolean}
 */
export function hasModifier (node: Node|Modifier[], modifier: Modifier["kind"]): boolean {
	const modifiers = Array.isArray(node) ? node : <ReadonlyArray<Modifier>|undefined> node.modifiers;
	return modifiers != null && modifiers.some(m => m.kind === modifier);
}