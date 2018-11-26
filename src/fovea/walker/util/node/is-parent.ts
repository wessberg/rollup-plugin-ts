import {isSourceFile, Node} from "typescript";

/**
 * Returns true if the given node is the parent of the other given node
 * @param {Node} parent
 * @param {Node} maybeChild
 * @returns {boolean}
 */
export function isParent (parent: Node, maybeChild: Node): boolean {
	if (parent === maybeChild) return false;

	let currentParent = maybeChild.parent;
	while (true) {
		if (currentParent == null || isSourceFile(currentParent)) return false;
		if (currentParent === parent) return true;
		currentParent = currentParent.parent;
	}
}