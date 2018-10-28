import {createNamedExports, ExportDeclaration, ExportSpecifier, isStringLiteralLike, updateExportDeclaration} from "typescript";
import {isExternalLibrary} from "../../../../util/path/path-util";

/**
 * Visits the given ExportDeclaration.
 * @param {ExportDeclaration} node
 * @param {Set<string>} usedExports
 * @returns {ExportDeclaration | undefined}
 */
export function visitExportDeclaration (node: ExportDeclaration, usedExports: Set<string>): ExportDeclaration|undefined {
	const isExternal = node.moduleSpecifier != null && isStringLiteralLike(node.moduleSpecifier) && isExternalLibrary(node.moduleSpecifier.text);

	const exportElementsToRemove: Set<ExportSpecifier> = new Set();
	if (node.exportClause != null) {
		for (const element of node.exportClause.elements) {

			// If the element isn't part of the used exports, or if it isn't aliased, remove it
			if (!usedExports.has(element.name.text) || (!isExternal && element.propertyName == null)) {
				exportElementsToRemove.add(element);
			}
		}

		const filteredElements = node.exportClause.elements.filter(element => !exportElementsToRemove.has(element));

		// If all of the exported elements should be removed from the output, remove the ExportDeclaration entirely
		if (filteredElements.length === 0) {
			return undefined;
		}

		// Otherwise, leave the relevant exports, but remove the moduleSpecifier
		else {
			return updateExportDeclaration(
				node,
				node.decorators,
				node.modifiers,
				createNamedExports(filteredElements),
				// Only leave module specifiers for external libraries
				isExternal ? node.moduleSpecifier : undefined
			);
		}
	}

	// Default to returning undefined
	return undefined;
}