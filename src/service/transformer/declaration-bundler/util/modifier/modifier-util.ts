import {Modifier, ModifiersArray, SyntaxKind, Node} from "typescript";

/**
 * Returns true if the given node has an Export keyword in front of it
 * @param {Node} node
 * @returns {boolean}
 */
export function hasExportModifier(node: Node): boolean {
	return node.modifiers != null && node.modifiers.some(isExportModifier);
}

/**
 * Returns true if the given modifier has an Export keyword in front of it
 * @param {Node} node
 * @returns {boolean}
 */
export function isExportModifier(node: Modifier): boolean {
	return node.kind === SyntaxKind.ExportKeyword;
}

/**
 * Returns true if the given modifier has an Default keyword in front of it
 * @param {Node} node
 * @returns {boolean}
 */
export function isDefaultModifier(node: Modifier): boolean {
	return node.kind === SyntaxKind.DefaultKeyword;
}

/**
 * Removes an export modifier from the given ModifiersArray
 * @param {ModifiersArray} modifiers
 * @returns {Modifier[]}
 */
export function removeExportModifier(modifiers: ModifiersArray | undefined): Modifier[] | undefined {
	if (modifiers == null) return modifiers;
	return modifiers.filter(modifier => !isExportModifier(modifier) && !isDefaultModifier(modifier));
}

/**
 * Returns true if the given modifiers contain the keywords 'export' and 'default'
 * @param {ModifiersArray} modifiers
 * @returns {Modifier[]}
 */
export function hasDefaultExportModifier(modifiers: ModifiersArray | undefined): boolean {
	if (modifiers == null) return false;
	return modifiers.some(modifier => isExportModifier(modifier)) && modifiers.some(modifier => isDefaultModifier(modifier));
}
