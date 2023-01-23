import type {TS} from "../../../../type/ts.js";
import {canHaveModifiers, getModifiers} from "./node-util.js";

export type Modifiers = TS.ModifiersArray | TS.Modifier[] | readonly TS.Modifier[] | readonly TS.ModifierLike[];

/**
 * Returns true if the given node has an Export keyword in front of it
 */
export function hasExportModifier(node: TS.Node, typescript: typeof TS): boolean {
	return canHaveModifiers(node, typescript) ? getModifiers(node, typescript)?.some(modifier => isExportModifier(modifier, typescript)) ?? false : false;
}

/**
 * Returns true if the given node has an Declare keyword in front of it
 */
export function hasDeclareModifier(node: TS.Node, typescript: typeof TS): boolean {
	return canHaveModifiers(node, typescript) ? getModifiers(node, typescript)?.some(modifier => isDeclareModifier(modifier, typescript)) ?? false : false;
}

/**
 * Returns true if the given modifier has an Export keyword in front of it
 */
export function isExportModifier(node: TS.ModifierLike, typescript: typeof TS): boolean {
	return node.kind === typescript.SyntaxKind.ExportKeyword;
}

/**
 * Returns true if the given modifier has an Default keyword in front of it
 */
export function isDefaultModifier(node: TS.ModifierLike, typescript: typeof TS): boolean {
	return node.kind === typescript.SyntaxKind.DefaultKeyword;
}

/**
 * Returns true if the given modifier has an declare keyword in front of it
 */
export function isDeclareModifier(node: TS.ModifierLike, typescript: typeof TS): boolean {
	return node.kind === typescript.SyntaxKind.DeclareKeyword;
}

/**
 * Removes an export modifier from the given ModifiersArray
 */
export function removeExportModifier<T extends Modifiers>(modifiers: T | undefined, typescript: typeof TS): T | undefined {
	if (modifiers == null) return modifiers;
	return modifiers.filter(modifier => !isExportModifier(modifier, typescript) && !isDefaultModifier(modifier, typescript)) as T;
}

/**
 * Removes a declare modifier from the given ModifiersArray
 */
export function removeDeclareModifier<T extends Modifiers>(modifiers: T | undefined, typescript: typeof TS): T | undefined {
	if (modifiers == null) return modifiers;
	return modifiers.filter(modifier => !isDeclareModifier(modifier, typescript)) as T;
}

/**
 * Removes an export modifier from the given ModifiersArray
 */
export function ensureHasDeclareModifier(modifiers: undefined, factory: TS.NodeFactory, typescript: typeof TS): readonly TS.Modifier[];
export function ensureHasDeclareModifier<T extends Modifiers>(modifiers: T, factory: TS.NodeFactory, typescript: typeof TS): T;
export function ensureHasDeclareModifier<T extends Modifiers>(modifiers: T | undefined, factory: TS.NodeFactory, typescript: typeof TS): readonly TS.Modifier[] | T;
export function ensureHasDeclareModifier<T extends Modifiers>(modifiers: T | undefined, factory: TS.NodeFactory, typescript: typeof TS): readonly TS.Modifier[] | T {
	if (modifiers == null) return [factory.createModifier(typescript.SyntaxKind.DeclareKeyword)];
	if (modifiers.some(m => m.kind === typescript.SyntaxKind.DeclareKeyword)) return modifiers;
	return [factory.createModifier(typescript.SyntaxKind.DeclareKeyword), ...modifiers] as T;
}

/**
 * Returns true if the given modifiers contain the keywords 'export' and 'default'
 */
export function hasDefaultExportModifier(modifiers: Modifiers | undefined, typescript: typeof TS): boolean {
	if (modifiers == null) return false;
	return modifiers.some(modifier => isExportModifier(modifier, typescript)) && modifiers.some(modifier => isDefaultModifier(modifier, typescript));
}
