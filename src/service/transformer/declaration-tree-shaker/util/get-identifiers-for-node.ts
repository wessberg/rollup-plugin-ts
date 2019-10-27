import {ReferenceCache} from "../reference/cache/reference-cache";
import {
	isBindingElement,
	isClassDeclaration,
	isEnumDeclaration,
	isExportSpecifier,
	isFunctionDeclaration,
	isIdentifier,
	isImportSpecifier,
	isInterfaceDeclaration,
	isTypeAliasDeclaration,
	Node
} from "typescript";

/**
 * Gets the Identifier for the given Node
 * @param {Node} node
 * @param {ReferenceCache} cache
 * @returns {string?}
 */
export function getIdentifierForNode(node: Node, cache: ReferenceCache): string | undefined {
	if (cache.identifierForNodeCache.has(node)) {
		return cache.identifierForNodeCache.get(node);
	} else {
		const identifier = computeIdentifierForNode(node, cache);
		cache.identifierForNodeCache.set(node, identifier);
		return identifier;
	}
}

/**
 * Gets all Identifiers for the given Node
 * @param {Node} node
 * @param {ReferenceCache} cache
 * @returns {string[]}
 */
function computeIdentifierForNode(node: Node, cache: ReferenceCache): string | undefined {
	if (isImportSpecifier(node)) {
		return node.name.text;
	} else if (isExportSpecifier(node)) {
		return node.propertyName != null ? node.propertyName.text : node.name.text;
	} else if (isBindingElement(node)) {
		return computeIdentifierForNode(node.name, cache);
	} else if (isIdentifier(node)) {
		return node.text;
	} else if (isFunctionDeclaration(node)) {
		return node.name != null ? node.name.text : undefined;
	} else if (isInterfaceDeclaration(node)) {
		return node.name.text;
	} else if (isTypeAliasDeclaration(node)) {
		return node.name.text;
	} else if (isClassDeclaration(node)) {
		return node.name != null ? node.name.text : undefined;
	} else if (isEnumDeclaration(node)) {
		return node.name.text;
	}

	return undefined;
}
