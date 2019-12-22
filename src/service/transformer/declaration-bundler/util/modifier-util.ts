import {TS} from "../../../../type/ts";

export type Modifiers = TS.ModifiersArray | TS.Modifier[];

/**
 * Returns true if the given node has an Export keyword in front of it
 */
export function hasExportModifier(node: TS.Node, typescript: typeof TS): boolean {
	return node.modifiers != null && node.modifiers.some(modifier => isExportModifier(modifier, typescript));
}

/**
 * Returns true if the given node has an Declare keyword in front of it
 */
export function hasDeclareModifier(node: TS.Node, typescript: typeof TS): boolean {
	return node.modifiers != null && node.modifiers.some(modifier => isDeclareModifier(modifier, typescript));
}

/**
 * Returns true if the given modifier has an Export keyword in front of it
 */
export function isExportModifier(node: TS.Modifier, typescript: typeof TS): boolean {
	return node.kind === typescript.SyntaxKind.ExportKeyword;
}

/**
 * Returns true if the given modifier has a Const keyword in front of it
 */
export function isConstModifier(node: TS.Modifier, typescript: typeof TS): boolean {
	return node.kind === typescript.SyntaxKind.ConstKeyword;
}

/**
 * Returns true if the given modifier has an Default keyword in front of it
 */
export function isDefaultModifier(node: TS.Modifier, typescript: typeof TS): boolean {
	return node.kind === typescript.SyntaxKind.DefaultKeyword;
}

/**
 * Returns true if the given modifier has an declare keyword in front of it
 */
export function isDeclareModifier(node: TS.Modifier, typescript: typeof TS): boolean {
	return node.kind === typescript.SyntaxKind.DeclareKeyword;
}

/**
 * Removes an export modifier from the given ModifiersArray
 */
export function removeExportModifier(modifiers: Modifiers | undefined, typescript: typeof TS): TS.Modifier[] | undefined {
	if (modifiers == null) return modifiers;
	return modifiers.filter(modifier => !isExportModifier(modifier, typescript) && !isDefaultModifier(modifier, typescript));
}

/**
 * Removes a declare modifier from the given ModifiersArray
 */
export function removeDeclareModifier(modifiers: Modifiers | undefined, typescript: typeof TS): TS.Modifier[] | undefined {
	if (modifiers == null) return modifiers;
	return modifiers.filter(modifier => !isDeclareModifier(modifier, typescript));
}

/**
 * Removes an export modifier from the given ModifiersArray
 */
export function ensureHasDeclareModifier(modifiers: Modifiers | undefined, typescript: typeof TS): TS.Modifier[] | TS.ModifiersArray | undefined {
	if (modifiers == null) return [typescript.createModifier(typescript.SyntaxKind.DeclareKeyword)];
	if (modifiers.some(m => m.kind === typescript.SyntaxKind.DeclareKeyword)) return modifiers;
	return [typescript.createModifier(typescript.SyntaxKind.DeclareKeyword), ...modifiers];
}

/**
 * Returns true if the given modifiers contain the keywords 'export' and 'default'
 */
export function hasDefaultExportModifier(modifiers: TS.ModifiersArray | undefined, typescript: typeof TS): boolean {
	if (modifiers == null) return false;
	return modifiers.some(modifier => isExportModifier(modifier, typescript)) && modifiers.some(modifier => isDefaultModifier(modifier, typescript));
}
