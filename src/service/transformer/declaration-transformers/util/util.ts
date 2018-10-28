import {Identifier, isClassDeclaration, isEnumDeclaration, isExportDeclaration, isFunctionDeclaration, isIdentifier, isImportDeclaration, isInterfaceDeclaration, isTypeAliasDeclaration, isVariableDeclaration, isVariableDeclarationList, isVariableStatement, KeywordTypeNode, Modifier, ModifiersArray, Node, SyntaxKind} from "typescript";
import {IReferenceCache} from "../cache/i-reference-cache";
import {DEBUG} from "../../../../constant/constant";

/**
 * Returns true if the given node has an Export keyword in front of it
 * @param {Node} node
 * @returns {boolean}
 */
export function hasExportModifier (node: Node): boolean {
	return node.modifiers != null && node.modifiers.some(isExportModifier);
}

/**
 * Returns true if the given Node is a KeywordTypeNode
 * @param {Node} node
 * @returns {node is KeywordTypeNode}
 */
export function isKeywordTypeNode (node: Node): node is KeywordTypeNode {
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

/**
 * Returns true if the given modifier has an Export keyword in front of it
 * @param {Node} node
 * @returns {boolean}
 */
export function isExportModifier (node: Modifier): boolean {
	return node.kind === SyntaxKind.ExportKeyword;
}

/**
 * Removes an export modifier from the given ModifiersArray
 * @param {ModifiersArray} modifiers
 * @returns {Modifier[]}
 */
export function removeExportModifier (modifiers: ModifiersArray|undefined): Modifier[]|undefined {
	if (modifiers == null) return modifiers;
	return modifiers.filter(modifier => !isExportModifier(modifier));
}

/**
 * Returns true if the given Node contains the given Child Node
 * @param {Node} parent
 * @param {Node} potentialChild
 * @returns {boolean}
 */
export function nodeContainsChild (parent: Node, potentialChild: Node): boolean {
	if (parent === potentialChild) return false;

	let candidate = potentialChild;
	while (candidate != null) {
		candidate = candidate.parent;
		if (candidate === parent) return true;
	}

	return false;
}

/**
 * Gets all Identifiers for the given Node
 * @param {Node} node
 * @param {IReferenceCache} cache
 * @returns {Identifier[]}
 */
export function getIdentifiersForNode (node: Node, cache: IReferenceCache): Identifier[] {
	if (cache.identifiersForNodeCache.has(node)) {
		return cache.identifiersForNodeCache.get(node);
	}

	else {
		const identifiers = computeIdentifiersForNode(node, cache);
		cache.identifiersForNodeCache.add(node, ...identifiers);
		return identifiers;
	}
}

/**
 * Gets all Identifiers for the given Node
 * @param {Node} node
 * @param {IReferenceCache} cache
 * @returns {Identifier[]}
 */
function computeIdentifiersForNode (node: Node, cache: IReferenceCache): Identifier[] {

	if (isIdentifier(node)) {
		return [node];
	}

	if (isVariableStatement(node)) {
		return getIdentifiersForNode(node.declarationList, cache);
	}

	else if (isVariableDeclarationList(node)) {
		return [].concat.apply([], ...node.declarations.map(declaration => getIdentifiersForNode(declaration, cache)));
	}

	else if (isVariableDeclaration(node)) {
		return isIdentifier(node.name) ? [node.name] : [];
	}

	else if (isFunctionDeclaration(node)) {
		return node.name != null ? [node.name] : [];
	}

	else if (isInterfaceDeclaration(node)) {
		return [node.name];
	}

	else if (isTypeAliasDeclaration(node)) {
		return [node.name];
	}

	else if (isClassDeclaration(node)) {
		return node.name != null ? [node.name] : [];
	}

	else if (isEnumDeclaration(node)) {
		return [node.name];
	}

	else if (isExportDeclaration(node) || isImportDeclaration(node)) {
		return [];
	}

	else if (node.kind === SyntaxKind.EndOfFileToken) {
		return [];
	}

	if (DEBUG) {
		console.log("getIdentifiersForNode:", SyntaxKind[node.kind]);
	}

	return [];
}