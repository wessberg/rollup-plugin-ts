import {
	createExportDeclaration,
	createExportSpecifier,
	createNamedExports,
	createStringLiteral,
	ExportDeclaration,
	ExportSpecifier,
	isStringLiteralLike,
	Symbol,
	SymbolFlags,
	updateExportDeclaration,
	updateNamedExports
} from "typescript";
import {normalizeModuleSpecifier} from "../../util/module-specifier/normalize-module-specifier";
import {UpdateExportsVisitorOptions} from "../update-exports-visitor-options";
import {setExtension} from "../../../../../util/path/path-util";
import {dirname, join} from "path";

/**
 * Visits the given ExportDeclaration.
 * @param {UpdateExportsVisitorOptions<ExportDeclaration>} options
 * @returns {ExportDeclaration | undefined}
 */
export function visitExportDeclaration({
	node,
	isEntry,
	sourceFile,
	supportedExtensions,
	relativeOutFileName,
	absoluteOutFileName,
	chunkToOriginalFileMap,
	exportedSpecifiersFromModule,
	getExportedSpecifiersFromModule,
	getParsedExportedSymbolsForModule,
	identifiersForDefaultExportsForModules
}: UpdateExportsVisitorOptions<ExportDeclaration>): ExportDeclaration | undefined {
	const specifier = node.moduleSpecifier;
	const symbol = (node as {symbol?: Symbol}).symbol;
	const isExportStar = symbol != null && (symbol.flags & SymbolFlags.ExportStar) !== 0;
	if (specifier == null || !isStringLiteralLike(specifier)) {
		// Remove the export if it exports no bindings at all
		if (node.moduleSpecifier == null && node.exportClause != null && node.exportClause.elements.length < 1) return undefined;
		else return node;
	}

	// Potentially rewrite the ModuleSpecifier text to refer to one of the generated chunk filenames (which may not be the same or named the same)
	const {isSameChunk, hasChanged, normalizedModuleSpecifier} = normalizeModuleSpecifier({
		supportedExtensions,
		specifier: specifier.text,
		sourceFile,
		chunkToOriginalFileMap,
		absoluteOutFileName,
		relativeOutFileName
	});

	// If it exports from the same chunk, don't include the module specifier.
	if (isSameChunk) {
		// If we're not in the entry file of the chunk, leave the export out!
		if (!isEntry) return undefined;

		// If everything should be exported,
		// instead add an export that explicitly adds named exports for all of the bindings that has had export modifiers but have been removed.
		// Default exports are not included in 'export *' declarations
		if (isExportStar) {
			const absoluteModuleSpecifierText = join(dirname(sourceFile.fileName), specifier.text);
			const missingExportSpecifiers = [...getParsedExportedSymbolsForModule(absoluteModuleSpecifierText)].filter(
				parsedExportedSymbol => !getExportedSpecifiersFromModule(absoluteModuleSpecifierText).has(parsedExportedSymbol)
			);

			// If there are no exported symbols at all, leave the ExportDeclaration out entirely
			if (missingExportSpecifiers.length < 1) return undefined;
			missingExportSpecifiers.forEach(exportedSymbol => getExportedSpecifiersFromModule(absoluteModuleSpecifierText).add(exportedSymbol));
			return createExportDeclaration(undefined, undefined, createNamedExports([...missingExportSpecifiers].map(exportSymbol => createExportSpecifier(undefined, exportSymbol))));
		} else {
			// Walk through all of the named exports.
			const exportSpecifiersWithReplacements: Map<ExportSpecifier, ExportSpecifier> = new Map();
			if (node.exportClause != null) {
				for (const element of node.exportClause.elements) {
					// If the 'default' export is exported, it will have been rewritten to a VariableStatement.
					// Replace "default" with the name of that variable.
					const propertyName = element.propertyName != null ? element.propertyName.text : element.name.text;
					if (propertyName === "default") {
						for (const extension of ["", ...supportedExtensions]) {
							const path = extension === "" ? join(dirname(sourceFile.fileName), specifier.text) : setExtension(join(dirname(sourceFile.fileName), specifier.text), extension);
							if (identifiersForDefaultExportsForModules.has(path)) {
								// We have a match!
								if (element.propertyName != null) {
									exportSpecifiersWithReplacements.set(element, createExportSpecifier(identifiersForDefaultExportsForModules.get(path)!, element.name));
								} else {
									exportSpecifiersWithReplacements.set(element, createExportSpecifier(identifiersForDefaultExportsForModules.get(path)!, "default"));
								}
								break;
							}
						}
						break;
					}
				}
			}

			const updatedSpecifiers = [
				...(node.exportClause == null ? [] : node.exportClause.elements.filter(element => !exportSpecifiersWithReplacements.has(element))),
				...exportSpecifiersWithReplacements.values()
			];

			updatedSpecifiers.forEach(updatedSpecifier => exportedSpecifiersFromModule.add(updatedSpecifier.propertyName != null ? updatedSpecifier.propertyName.text : updatedSpecifier.name.text));

			return updateExportDeclaration(
				node,
				node.decorators,
				node.modifiers,
				exportSpecifiersWithReplacements.size > 0 && node.exportClause != null ? updateNamedExports(node.exportClause, updatedSpecifiers) : node.exportClause,
				undefined
			);
		}
	} else if (hasChanged) {
		return updateExportDeclaration(node, node.decorators, node.modifiers, node.exportClause, createStringLiteral(normalizedModuleSpecifier));
	}

	// Otherwise, return the node as it was
	else {
		return node;
	}
}
