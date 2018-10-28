import {createImportClause, ImportDeclaration, ImportSpecifier, isNamedImports, isNamespaceImport, isStringLiteralLike, SourceFile, updateImportDeclaration} from "typescript";
import {isExternalLibrary} from "../../../../util/path/path-util";
import {hasReferences} from "../reference/has-references";
import {IReferenceCache} from "../cache/i-reference-cache";

/**
 * Visits the given ImportDeclaration or ExportDeclaration.
 * @param {ImportDeclaration} node
 * @param {Set<string>} usedExports
 * @param {SourceFile} sourceFile
 * @param {IReferenceCache} cache
 * @returns {ImportDeclaration | undefined}
 */
export function visitImportDeclaration (node: ImportDeclaration, usedExports: Set<string>, sourceFile: SourceFile, cache: IReferenceCache): ImportDeclaration|undefined {
	// If the import is relative to the current project, or if nothing is imported from the module, don't include it. Everything will already be part of the SourceFile
	if (!isStringLiteralLike(node.moduleSpecifier) || !isExternalLibrary(node.moduleSpecifier.text) || node.importClause == null) return undefined;

	// Check if the default import should be removed - if it has any
	const removeDefaultImport = node.importClause.name == null || !hasReferences(node.importClause.name, usedExports, sourceFile, cache);

	// Also check for its' named bindings
	if (node.importClause.namedBindings != null) {
		if (isNamespaceImport(node.importClause.namedBindings)) {
			const removeNamespaceImport = !hasReferences(node.importClause.namedBindings, usedExports, sourceFile, cache);

			// If neither the namespace import nor the default import (if it has any) are being used, don't include the node
			if (removeDefaultImport && removeNamespaceImport) {
				return undefined;
			}

			else if (!removeDefaultImport && removeNamespaceImport) {
				return updateImportDeclaration(
					node,
					node.decorators,
					node.modifiers,
					createImportClause(
						node.importClause.name,
						undefined
					),
					node.moduleSpecifier
				);
			}

			else if (removeDefaultImport && !removeNamespaceImport) {
				return updateImportDeclaration(
					node,
					node.decorators,
					node.modifiers,
					createImportClause(
						undefined,
						node.importClause.namedBindings
					),
					node.moduleSpecifier
				);
			}

			// Otherwise, everything is used. Keep it as it is
			else {
				return node;
			}
		}

		else if (isNamedImports(node.importClause.namedBindings)) {
			const importElementsToRemove: Set<ImportSpecifier> = new Set();

			for (const element of node.importClause.namedBindings.elements) {

				// If the element isn't referenced, remove it
				if (!hasReferences(element.name, usedExports, sourceFile, cache)) {
					importElementsToRemove.add(element);
				}
			}

			const filteredElements = node.importClause.namedBindings.elements.filter(element => !importElementsToRemove.has(element));

			// If neither the namespace import nor any of the imported bindings (if it has any) are being used, don't include the node
			if (removeDefaultImport && filteredElements.length === 0) {
				return undefined;
			}

			else if (!removeDefaultImport && filteredElements.length === 0) {
				return updateImportDeclaration(
					node,
					node.decorators,
					node.modifiers,
					createImportClause(
						node.importClause.name,
						undefined
					),
					node.moduleSpecifier
				);
			}

			else if (removeDefaultImport) {
				return updateImportDeclaration(
					node,
					node.decorators,
					node.modifiers,
					createImportClause(
						undefined,
						node.importClause.namedBindings
					),
					node.moduleSpecifier
				);
			}

			// Otherwise, everything is being used
			else {
				return node;
			}
		}
	}

	// If no named imports are included, but the import either includes the default import or has none, don't include the import
	else {
		if (removeDefaultImport) {
			return undefined;
		}

		// Otherwise, keep it
		else {
			return node;
		}
	}

	// Default to not including the Import
	return undefined;
}