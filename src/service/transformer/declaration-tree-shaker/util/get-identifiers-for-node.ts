import {ReferenceCache} from "../reference/cache/reference-cache";
import {
	isClassDeclaration,
	isEnumDeclaration,
	isExportDeclaration,
	isFunctionDeclaration,
	isIdentifier,
	isImportDeclaration,
	isInterfaceDeclaration,
	isNamespaceImport,
	isTypeAliasDeclaration,
	isVariableDeclaration,
	isVariableDeclarationList,
	isVariableStatement,
	Node,
	SyntaxKind
} from "typescript";

/**
 * Gets all Identifiers for the given Node
 * @param {Node} node
 * @param {ReferenceCache} cache
 * @returns {string[]}
 */
export function getIdentifiersForNode(node: Node, cache: ReferenceCache): string[] {
	if (cache.identifiersForNodeCache.has(node)) {
		return cache.identifiersForNodeCache.get(node);
	} else {
		const identifiers = computeIdentifiersForNode(node, cache);
		cache.identifiersForNodeCache.add(node, ...identifiers);
		return identifiers;
	}
}

/**
 * Gets all Identifiers for the given Node
 * @param {Node} node
 * @param {ReferenceCache} cache
 * @returns {string[]}
 */
function computeIdentifiersForNode(node: Node, cache: ReferenceCache): string[] {
	if (isIdentifier(node)) {
		return [node.text];
	}

	if (isVariableStatement(node)) {
		return getIdentifiersForNode(node.declarationList, cache);
	} else if (isVariableDeclarationList(node)) {
		return ([] as string[]).concat.apply([], node.declarations.map(declaration => getIdentifiersForNode(declaration, cache)));
	} else if (isVariableDeclaration(node)) {
		return isIdentifier(node.name) ? [node.name.text] : [];
	} else if (isFunctionDeclaration(node)) {
		return node.name != null ? [node.name.text] : [];
	} else if (isInterfaceDeclaration(node)) {
		return [node.name.text];
	} else if (isTypeAliasDeclaration(node)) {
		return [node.name.text];
	} else if (isClassDeclaration(node)) {
		return node.name != null ? [node.name.text] : [];
	} else if (isEnumDeclaration(node)) {
		return [node.name.text];
	} else if (isImportDeclaration(node)) {
		if (node.importClause == null) return [];
		return [
			...(node.importClause.name == null ? [] : [node.importClause.name.text]),
			...(node.importClause.namedBindings == null
				? []
				: isNamespaceImport(node.importClause.namedBindings)
				? [node.importClause.namedBindings.name.text]
				: node.importClause.namedBindings.elements.map(element => element.name.text))
		];
	} else if (isExportDeclaration(node)) {
		if (node.exportClause == null) return [];
		return node.exportClause.elements.map(element => element.name.text);
	} else if (isNamespaceImport(node)) {
		return [];
	} else if (node.kind === SyntaxKind.EndOfFileToken) {
		return [];
	}

	return [];
}
