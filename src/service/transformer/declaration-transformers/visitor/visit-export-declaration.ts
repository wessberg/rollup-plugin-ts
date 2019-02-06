import {createNamedExports, createStringLiteral, ExportDeclaration, ExportSpecifier, Expression, isStringLiteralLike, Symbol, SymbolFlags, updateExportDeclaration} from "typescript";
import {ensureHasLeadingDot, ensureRelative, isExternalLibrary, stripExtension} from "../../../../util/path/path-util";
import {VisitorOptions} from "./visitor-options";
import {dirname} from "path";
import {matchModuleSpecifier} from "../../../../util/match-module-specifier/match-module-specifier";
import {tryFindAbsolutePath} from "../../../../util/try-find-absolute-path/try-find-absolute-path";

/**
 * Visits the given ExportDeclaration.
 * @param {VisitorOptions<ExportDeclaration>} options
 * @returns {ExportDeclaration | undefined}
 */
export function visitExportDeclaration({
	node,
	sourceFile,
	usedExports,
	outFileName,
	moduleNames,
	localModuleNames,
	supportedExtensions,
	chunkToOriginalFileMap,
	fileToRewrittenIncludedExportModuleSpecifiersMap
}: VisitorOptions<ExportDeclaration>): ExportDeclaration | undefined {
	const isExternal = node.moduleSpecifier != null && isStringLiteralLike(node.moduleSpecifier) && isExternalLibrary(node.moduleSpecifier.text);

	const exportElementsToRemove: Set<ExportSpecifier> = new Set();
	const symbol = (node as {symbol?: Symbol}).symbol;
	const isExportStar = symbol != null && (symbol.flags & SymbolFlags.ExportStar) !== 0;

	let moduleSpecifier: Expression | undefined;
	if (isExternal) {
		moduleSpecifier = node.moduleSpecifier;
	} else {
		if (node.moduleSpecifier == null || !isStringLiteralLike(node.moduleSpecifier)) moduleSpecifier = node.moduleSpecifier;
		else {
			// Compute the absolute path
			const absoluteModuleSpecifier = tryFindAbsolutePath(node.moduleSpecifier.text, supportedExtensions, moduleNames);
			// If the path that it exports from is already part of this chunk, simply exclude the module specifier
			const match = matchModuleSpecifier(absoluteModuleSpecifier, supportedExtensions, localModuleNames);

			if (match != null && isExportStar) {
				return undefined;
			}

			// Otherwise, assume that it is being exported from a generated chunk. Try to find it
			const matchInChunks = [...chunkToOriginalFileMap.entries()].find(
				([, originals]) => originals.find(original => matchModuleSpecifier(absoluteModuleSpecifier, supportedExtensions, [original]) != null) != null
			);

			// If nothing was found, or if the module is the same as the current one ignore this ExportDeclaration
			if (matchInChunks == null || stripExtension(outFileName) === stripExtension(matchInChunks[0])) {
				return undefined;
			} else {
				// Otherwise, compute a relative path and update the moduleSpecifier
				const text = ensureHasLeadingDot(stripExtension(ensureRelative(dirname(outFileName), matchInChunks[0])));

				// If it is a 'star' export, verify that an export hasn't already been added to the file for the current chunk
				if (isExportStar) {
					const existing = fileToRewrittenIncludedExportModuleSpecifiersMap.get(sourceFile.fileName);
					if (existing != null && existing.has(text)) return undefined;
					else {
						moduleSpecifier = createStringLiteral(text);
						if (existing != null) existing.add(text);
						else fileToRewrittenIncludedExportModuleSpecifiersMap.set(sourceFile.fileName, new Set([text]));
					}
				} else {
					moduleSpecifier = createStringLiteral(text);
				}
			}
		}
	}

	if (isExportStar) {
		return updateExportDeclaration(node, node.decorators, node.modifiers, node.exportClause, moduleSpecifier);
	}

	if (node.exportClause != null) {
		for (const element of node.exportClause.elements) {
			// If the element isn't part of the used exports, or if it isn't aliased, remove it
			if (!usedExports.has(element.name.text) || (!isExternal && moduleSpecifier == null && element.propertyName == null)) {
				exportElementsToRemove.add(element);
			}
		}

		const filteredElements = node.exportClause.elements.filter(element => !exportElementsToRemove.has(element));

		// If all of the exported elements should be removed from the output, remove the ExportDeclaration entirely
		if (filteredElements.length === 0) {
			return undefined;
		}

		// Otherwise, leave the relevant exports
		else {
			return updateExportDeclaration(node, node.decorators, node.modifiers, createNamedExports(filteredElements), moduleSpecifier);
		}
	}

	// Default to returning undefined
	return undefined;
}
