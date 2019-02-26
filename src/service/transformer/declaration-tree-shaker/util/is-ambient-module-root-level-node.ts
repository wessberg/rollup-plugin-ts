import {
	isClassDeclaration,
	isEnumDeclaration,
	isExportAssignment,
	isExportDeclaration,
	isFunctionDeclaration,
	isInterfaceDeclaration,
	isModuleDeclaration,
	isTypeAliasDeclaration,
	isVariableStatement,
	Node
} from "typescript";

/**
 * Returns true if the given Node is a root-level node in an ambient module
 * @param {Node} node
 * @return {boolean}
 */
export function isAmbientModuleRootLevelNode(node: Node): boolean {
	return (
		isExportDeclaration(node) ||
		isExportAssignment(node) ||
		isInterfaceDeclaration(node) ||
		isModuleDeclaration(node) ||
		isEnumDeclaration(node) ||
		isClassDeclaration(node) ||
		isTypeAliasDeclaration(node) ||
		isFunctionDeclaration(node) ||
		isVariableStatement(node)
	);
}
