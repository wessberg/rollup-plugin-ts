import {
	createEmptyStatement,
	createExportDeclaration,
	createExportSpecifier,
	createIdentifier,
	createNamedExports,
	createStringLiteral,
	DeclarationStatement,
	ExportDeclaration,
	ExportSpecifier,
	ImportDeclaration,
	isStringLiteralLike,
	updateExportDeclaration,
	updateNamedExports
} from "typescript";
import {normalizeModuleSpecifier} from "../../util/module-specifier/normalize-module-specifier";
import {UpdateExportsVisitorOptions} from "../update-exports-visitor-options";
import {setExtension} from "../../../../../util/path/path-util";
import {dirname, join, normalize} from "path";
import {getAliasedDeclaration} from "../../util/symbol/get-aliased-declaration";

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
	parsedExportedSymbols,
	typeChecker,
	identifiersForDefaultExportsForModules,
	exportsFromExternalModules,
	updatedIdentifierNamesForModuleMap
}: UpdateExportsVisitorOptions<ExportDeclaration>): ExportDeclaration | ImportDeclaration | undefined {
	const specifier = node.moduleSpecifier;
	const isExportStar = node.exportClause == null;

	if (specifier == null || !isStringLiteralLike(specifier)) {
		// Remove the export if it exports no bindings at all
		if (node.moduleSpecifier == null && node.exportClause != null && node.exportClause.elements.length < 1) return undefined;
		else {
			if (node.exportClause != null) {
				for (const element of node.exportClause.elements) {
					const ref = element.propertyName != null ? element.propertyName : element.name;

					const declaration = getAliasedDeclaration(ref, typeChecker);
					if (declaration != null) {
						element.name.text === "default"
							? identifiersForDefaultExportsForModules.set(normalize(sourceFile.fileName), [ref.text, declaration])
							: parsedExportedSymbols.set(ref.text, [undefined, (declaration as unknown) as DeclarationStatement]);
					}
				}
			}
			return node;
		}
	}

	// Potentially rewrite the ModuleSpecifier text to refer to one of the generated chunk filenames (which may not be the same or named the same)
	const {isSameChunk, hasChanged, normalizedModuleSpecifier, absoluteModuleSpecifier, isExternal} = normalizeModuleSpecifier({
		supportedExtensions,
		specifier: specifier.text,
		sourceFile,
		chunkToOriginalFileMap,
		absoluteOutFileName,
		relativeOutFileName
	});

	if (isExternal && !isEntry) {
		exportsFromExternalModules.set(specifier.text, node);
		return undefined;
	}

	// If it exports from the same chunk, don't include the module specifier.
	if (isSameChunk) {
		if (!isEntry) {
			// If we're not in the entry file, we may be re-exporting symbols from another file.
			// Add these symbols to the parsed exported symbols for the file
			const absoluteModuleSpecifierText = join(dirname(normalize(sourceFile.fileName)), specifier.text);
			const otherSymbols = [...getParsedExportedSymbolsForModule(absoluteModuleSpecifierText).keys()];
			const otherExportedSpecifiers = getExportedSpecifiersFromModule(absoluteModuleSpecifierText);
			let missingExportSpecifiers: [string, string | undefined][];

			if (isExportStar) {
				missingExportSpecifiers = otherSymbols
					.filter(parsedExportedSymbol => !otherExportedSpecifiers.has(parsedExportedSymbol))
					.map(otherSymbol => [otherSymbol, undefined]);
			} else {
				missingExportSpecifiers = node.exportClause!.elements.map(el =>
					el.propertyName == null ? [el.name.text, undefined] : [el.propertyName.text, el.name.text]
				);
			}

			missingExportSpecifiers.forEach(([exportedSymbol, propertyName]) => {
				parsedExportedSymbols.set(exportedSymbol, [propertyName, createEmptyStatement()]);
			});

			// If we're not in the entry file of the chunk, leave the export out!
			return undefined;
		}

		// If everything should be exported,
		// instead add an export that explicitly adds named exports for all of the bindings that has had export modifiers but have been removed.
		// Default exports are not included in 'export *' declarations
		if (isExportStar) {
			const absoluteModuleSpecifierText = join(dirname(normalize(sourceFile.fileName)), specifier.text);

			const missingExportSpecifiers = [...getParsedExportedSymbolsForModule(absoluteModuleSpecifierText).keys()].filter(
				parsedExportedSymbol => !getExportedSpecifiersFromModule(absoluteModuleSpecifierText).has(parsedExportedSymbol)
			);

			// If there are no exported symbols at all, leave the ExportDeclaration out entirely
			if (missingExportSpecifiers.length < 1) return undefined;
			missingExportSpecifiers.forEach(exportedSymbol => getExportedSpecifiersFromModule(absoluteModuleSpecifierText).add(exportedSymbol));
			return createExportDeclaration(
				undefined,
				undefined,
				createNamedExports([...missingExportSpecifiers].map(exportSymbol => createExportSpecifier(undefined, exportSymbol)))
			);
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
							const path =
								extension === ""
									? join(dirname(normalize(sourceFile.fileName)), specifier.text)
									: setExtension(join(dirname(normalize(sourceFile.fileName)), specifier.text), extension);
							if (identifiersForDefaultExportsForModules.has(path)) {
								// We have a match!
								if (element.propertyName != null) {
									exportSpecifiersWithReplacements.set(
										element,
										createExportSpecifier(identifiersForDefaultExportsForModules.get(path)![0], element.name.text)
									);
								} else {
									exportSpecifiersWithReplacements.set(
										element,
										createExportSpecifier(identifiersForDefaultExportsForModules.get(path)![0], "default")
									);
								}
								break;
							}
						}
						break;
					} else {
						// If we're doing something like 'export {Foo} from "./foo"', but '/foo' is going to be part of this chunk, the export will
						// be changed to 'export {Foo}', but if 'Foo' is in turn deconflicted into something like 'Foo_$0', we'll have to alias the export
						// like 'export {Foo_$0 as Foo}'

						for (const extension of ["", ...supportedExtensions]) {
							const path = setExtension(absoluteModuleSpecifier, extension);

							const updatedIdentifiersForReferencedModule = updatedIdentifierNamesForModuleMap.get(path);

							if (updatedIdentifiersForReferencedModule != null && updatedIdentifiersForReferencedModule.has(propertyName)) {
								exportSpecifiersWithReplacements.set(
									element,
									createExportSpecifier(
										createIdentifier(updatedIdentifiersForReferencedModule.get(propertyName)!),
										createIdentifier(element.name.text)
									)
								);
								break;
							}
						}
					}
				}
			}

			const updatedSpecifiers = [
				...(node.exportClause == null ? [] : node.exportClause.elements.filter(element => !exportSpecifiersWithReplacements.has(element))),
				...exportSpecifiersWithReplacements.values()
			];

			updatedSpecifiers.forEach(updatedSpecifier =>
				exportedSpecifiersFromModule.add(updatedSpecifier.propertyName != null ? updatedSpecifier.propertyName.text : updatedSpecifier.name.text)
			);

			return updateExportDeclaration(
				node,
				node.decorators,
				node.modifiers,
				exportSpecifiersWithReplacements.size > 0 && node.exportClause != null
					? updateNamedExports(node.exportClause, updatedSpecifiers)
					: node.exportClause,
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
