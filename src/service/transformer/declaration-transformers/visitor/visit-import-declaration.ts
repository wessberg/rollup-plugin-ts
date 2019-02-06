import {createImportClause, createStringLiteral, Expression, ImportDeclaration, ImportSpecifier, isNamedImports, isNamespaceImport, isStringLiteralLike, updateImportDeclaration} from "typescript";
import {ensureHasLeadingDot, ensureRelative, isExternalLibrary, stripExtension} from "../../../../util/path/path-util";
import {hasReferences} from "../reference/has-references";
import {VisitorOptions} from "./visitor-options";
import {dirname, join} from "path";
import {matchModuleSpecifier} from "../../../../util/match-module-specifier/match-module-specifier";

/**
 * Visits the given ImportDeclaration.
 * @param {VisitorOptions<ImportDeclaration>} options
 * @returns {ImportDeclaration | undefined}
 */
export function visitImportDeclaration({
	node,
	usedExports,
	sourceFile,
	cache,
	entryFileName,
	supportedExtensions,
	moduleNames,
	chunkToOriginalFileMap,
	outFileName
}: VisitorOptions<ImportDeclaration>): ImportDeclaration | undefined {
	// If nothing is imported from the module, or if the Import is importing things that are already part of this chunk, don't include it. Everything will already be part of the SourceFile
	if (!isStringLiteralLike(node.moduleSpecifier) || node.importClause == null) return undefined;

	let moduleSpecifier: Expression | undefined;
	if (isExternalLibrary(node.moduleSpecifier.text)) {
		moduleSpecifier = node.moduleSpecifier;
	} else {
		// Compute the absolute path
		const absoluteModuleSpecifier = join(dirname(entryFileName), node.moduleSpecifier.text);
		// If the path that it imports from is already part of this chunk, don't include the ImportDeclaration
		const match = matchModuleSpecifier(absoluteModuleSpecifier, supportedExtensions, moduleNames);

		if (match != null) return undefined;

		// Otherwise, assume that it is being imported from a generated chunk. Try to find it
		const matchInChunks = [...chunkToOriginalFileMap.entries()].find(
			([, originals]) => originals.find(original => matchModuleSpecifier(absoluteModuleSpecifier, supportedExtensions, [original]) != null) != null
		);

		// If nothing was found, ignore this ImportDeclaration
		if (matchInChunks == null || stripExtension(outFileName) === stripExtension(matchInChunks[0])) {
			return undefined;
		} else {
			// Otherwise, compute a relative path and update the moduleSpecifier
			moduleSpecifier = createStringLiteral(ensureHasLeadingDot(stripExtension(ensureRelative(dirname(outFileName), matchInChunks[0]))));
		}
	}

	// Check if the default import should be removed - if it has any
	const removeDefaultImport = node.importClause.name == null || !hasReferences(node.importClause.name, usedExports, sourceFile, cache, chunkToOriginalFileMap);

	// Also check for its' named bindings
	if (node.importClause.namedBindings != null) {
		if (isNamespaceImport(node.importClause.namedBindings)) {
			const removeNamespaceImport = !hasReferences(node.importClause.namedBindings, usedExports, sourceFile, cache, chunkToOriginalFileMap);

			// If neither the namespace import nor the default import (if it has any) are being used, don't include the node
			if (removeDefaultImport && removeNamespaceImport) {
				return undefined;
			} else if (!removeDefaultImport && removeNamespaceImport) {
				return updateImportDeclaration(node, node.decorators, node.modifiers, createImportClause(node.importClause.name, undefined), moduleSpecifier);
			} else if (removeDefaultImport && !removeNamespaceImport) {
				return updateImportDeclaration(node, node.decorators, node.modifiers, createImportClause(undefined, node.importClause.namedBindings), moduleSpecifier);
			}

			// Otherwise, everything is used. Keep it as it is
			else {
				return node;
			}
		} else if (isNamedImports(node.importClause.namedBindings)) {
			const importElementsToRemove: Set<ImportSpecifier> = new Set();

			for (const element of node.importClause.namedBindings.elements) {
				// If the element isn't referenced, remove it
				if (!hasReferences(element.name, usedExports, sourceFile, cache, chunkToOriginalFileMap)) {
					importElementsToRemove.add(element);
				}
			}

			const filteredElements = node.importClause.namedBindings.elements.filter(element => !importElementsToRemove.has(element));

			// If neither the namespace import nor any of the imported bindings (if it has any) are being used, don't include the node
			if (removeDefaultImport && filteredElements.length === 0) {
				return undefined;
			} else if (!removeDefaultImport && filteredElements.length === 0) {
				return updateImportDeclaration(node, node.decorators, node.modifiers, createImportClause(node.importClause.name, undefined), moduleSpecifier);
			} else if (removeDefaultImport) {
				return updateImportDeclaration(node, node.decorators, node.modifiers, createImportClause(undefined, node.importClause.namedBindings), moduleSpecifier);
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
