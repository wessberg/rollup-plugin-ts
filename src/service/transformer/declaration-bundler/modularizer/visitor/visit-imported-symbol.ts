import {dirname, relative} from "path";
import {ensureHasLeadingDotAndPosix, stripKnownExtension} from "../../../../../util/path/path-util";
import {SupportedExtensions} from "../../../../../util/get-supported-extensions/get-supported-extensions";
import {ChunkToOriginalFileMap} from "../../../../../util/chunk/get-chunk-to-original-file-map";
import {
	ImportedSymbol,
	NamedExportedSymbol,
	NamedImportedSymbol,
	SourceFileToExportedSymbolSet,
	SourceFileToLocalSymbolMap
} from "../../../declaration-pre-bundler/declaration-pre-bundler-options";
import {getChunkFilename} from "../../../declaration-pre-bundler/util/get-chunk-filename/get-chunk-filename";
import {ensureHasDeclareModifier, removeExportAndDeclareModifiers} from "../../../declaration-pre-bundler/util/modifier/modifier-util";
import {ChunkForModuleCache} from "../../../declaration/declaration-options";
import {cloneNode} from "@wessberg/ts-clone-node";
import {TS} from "../../../../../type/ts";

export interface VisitImportedSymbolOptions {
	typescript: typeof TS;
	chunkForModuleCache: ChunkForModuleCache;
	sourceFileToLocalSymbolMap: SourceFileToLocalSymbolMap;
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	importedSymbol: ImportedSymbol;
	module: string;
	supportedExtensions: SupportedExtensions;
	chunkToOriginalFileMap: ChunkToOriginalFileMap;
	relativeChunkFileName: string;
	absoluteChunkFileName: string;
}

export function createAliasedBinding(
	importedSymbol: NamedImportedSymbol,
	propertyName: string,
	typescript: typeof TS
): TS.ImportDeclaration | TS.TypeAliasDeclaration | TS.VariableStatement {
	switch (importedSymbol.node.kind) {
		case typescript.SyntaxKind.ClassDeclaration:
		case typescript.SyntaxKind.ClassExpression:
		case typescript.SyntaxKind.FunctionDeclaration:
		case typescript.SyntaxKind.FunctionExpression:
		case typescript.SyntaxKind.EnumDeclaration:
		case typescript.SyntaxKind.VariableDeclaration:
		case typescript.SyntaxKind.VariableStatement:
		case typescript.SyntaxKind.ExportAssignment: {
			return typescript.createVariableStatement(
				ensureHasDeclareModifier(undefined, typescript),
				typescript.createVariableDeclarationList(
					[
						typescript.createVariableDeclaration(
							typescript.createIdentifier(importedSymbol.name),
							typescript.createTypeQueryNode(typescript.createIdentifier(propertyName))
						)
					],
					typescript.NodeFlags.Const
				)
			);
		}

		default: {
			return typescript.createTypeAliasDeclaration(
				undefined,
				undefined,
				typescript.createIdentifier(importedSymbol.name),
				undefined,
				typescript.createTypeReferenceNode(typescript.createIdentifier(propertyName), undefined)
			);
		}
	}
}

function getAllNamedExportsForModule(moduleName: string, sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet): NamedExportedSymbol[] {
	const exportedSymbols = sourceFileToExportedSymbolSet.get(moduleName);
	if (exportedSymbols == null) return [];
	const namedExportedSymbols: NamedExportedSymbol[] = [];

	for (const exportedSymbol of exportedSymbols) {
		if ("namespaceExport" in exportedSymbol) {
			if (exportedSymbol.originalModule !== moduleName) {
				namedExportedSymbols.push(...getAllNamedExportsForModule(exportedSymbol.originalModule, sourceFileToExportedSymbolSet));
			}
		} else if (!exportedSymbol.defaultExport) {
			namedExportedSymbols.push(exportedSymbol);
		}
	}

	return namedExportedSymbols;
}

export function visitImportedSymbol(
	options: VisitImportedSymbolOptions
): (TS.ImportDeclaration | TS.TypeAliasDeclaration | TS.ModuleDeclaration | TS.VariableStatement)[] {
	const {importedSymbol, sourceFileToExportedSymbolSet, sourceFileToLocalSymbolMap, absoluteChunkFileName, typescript} = options;
	const otherChunkFileName = getChunkFilename({...options, fileName: importedSymbol.originalModule});
	const importDeclarations: (TS.ImportDeclaration | TS.TypeAliasDeclaration | TS.ModuleDeclaration)[] = [];

	// Generate a module specifier that points to the referenced module, relative to the current sourcefile
	const relativeToSourceFileDirectory =
		importedSymbol.isExternal && importedSymbol.rawModuleSpecifier != null
			? importedSymbol.rawModuleSpecifier
			: otherChunkFileName == null
			? importedSymbol.originalModule
			: relative(dirname(absoluteChunkFileName), otherChunkFileName.fileName);
	const moduleSpecifier =
		importedSymbol.isExternal && importedSymbol.rawModuleSpecifier != null
			? importedSymbol.rawModuleSpecifier
			: ensureHasLeadingDotAndPosix(stripKnownExtension(relativeToSourceFileDirectory), false);

	// Find the local symbols for the referenced module
	const otherModuleLocalSymbols = sourceFileToLocalSymbolMap.get(importedSymbol.originalModule);

	// Find the exported symbols for the referenced module
	const otherModuleExportedSymbols = sourceFileToExportedSymbolSet.get(importedSymbol.originalModule);

	// If the module originates from a file not part of the compilation (such as an external module),
	// always include the import
	if (otherChunkFileName == null || importedSymbol.isExternal) {
		return [
			...importDeclarations,
			typescript.createImportDeclaration(
				undefined,
				undefined,
				typescript.createImportClause(
					"defaultImport" in importedSymbol && importedSymbol.defaultImport ? typescript.createIdentifier(importedSymbol.name) : undefined,
					"namespaceImport" in importedSymbol
						? typescript.createNamespaceImport(typescript.createIdentifier(importedSymbol.name))
						: importedSymbol.defaultImport
						? undefined
						: typescript.createNamedImports([
								typescript.createImportSpecifier(
									importedSymbol.propertyName != null ? typescript.createIdentifier(importedSymbol.propertyName) : undefined,
									typescript.createIdentifier(importedSymbol.name)
								)
						  ])
				),
				typescript.createStringLiteral(moduleSpecifier)
			)
		];
	}

	// If the import originates from a module within the same chunk,
	if (absoluteChunkFileName === otherChunkFileName.fileName) {
		// Most likely, the import should be left out, given that the symbol
		// might already be part of the chunk.
		// But, there can be plenty reasons why that would not be the case.
		// For example, it may be a default import in which case the name may not be equal to that of
		// the original binding.
		// Or, it may be something like 'export {...} from "..."'
		// in which case *that* might be part of a different chunk (or none at all).
		if (otherModuleExportedSymbols != null) {
			const propertyName =
				"propertyName" in importedSymbol && importedSymbol.propertyName != null ? importedSymbol.propertyName : importedSymbol.name;
			const matchingExportedSymbol = [...otherModuleExportedSymbols].find(exportedSymbol =>
				"defaultImport" in importedSymbol && importedSymbol.defaultImport
					? "defaultExport" in exportedSymbol && exportedSymbol.defaultExport
					: !("namespaceExport" in exportedSymbol) && exportedSymbol.name === propertyName
			);

			if (matchingExportedSymbol != null) {
				const matchingExportedSymbolChunk = getChunkFilename({...options, fileName: matchingExportedSymbol.originalModule});

				// If the chunk in which the exported binding resides isn't part of the same chunk, import the binding into the current module
				if (
					matchingExportedSymbolChunk == null ||
					matchingExportedSymbol.isExternal ||
					absoluteChunkFileName !== matchingExportedSymbolChunk.fileName
				) {
					const otherRelativeToSourceFileDirectory =
						matchingExportedSymbol.isExternal && matchingExportedSymbol.rawModuleSpecifier != null
							? matchingExportedSymbol.rawModuleSpecifier
							: relative(dirname(importedSymbol.originalModule), matchingExportedSymbol.originalModule);
					const otherUpdatedModuleSpecifierText =
						matchingExportedSymbol.isExternal && matchingExportedSymbol.rawModuleSpecifier != null
							? matchingExportedSymbol.rawModuleSpecifier
							: ensureHasLeadingDotAndPosix(stripKnownExtension(otherRelativeToSourceFileDirectory), false);

					importDeclarations.push(
						typescript.createImportDeclaration(
							undefined,
							undefined,
							typescript.createImportClause(
								"defaultExport" in matchingExportedSymbol && matchingExportedSymbol.defaultExport
									? typescript.createIdentifier(importedSymbol.name)
									: undefined,
								"namespaceExport" in matchingExportedSymbol
									? typescript.createNamespaceImport(typescript.createIdentifier(importedSymbol.name))
									: "defaultExport" in matchingExportedSymbol && matchingExportedSymbol.defaultExport
									? undefined
									: typescript.createNamedImports([
											typescript.createImportSpecifier(
												matchingExportedSymbol.propertyName != null ? typescript.createIdentifier(matchingExportedSymbol.propertyName) : undefined,
												typescript.createIdentifier(importedSymbol.name)
											)
									  ])
							),
							typescript.createStringLiteral(otherUpdatedModuleSpecifierText)
						)
					);
				} else if (
					"defaultImport" in importedSymbol &&
					importedSymbol.defaultImport &&
					"name" in matchingExportedSymbol &&
					matchingExportedSymbol.name !== importedSymbol.name
				) {
					return [...importDeclarations, createAliasedBinding(importedSymbol, matchingExportedSymbol.name, typescript)];
				}
			}
		}

		// Create a TypeAlias that aliases the imported property
		if ("propertyName" in importedSymbol && importedSymbol.propertyName != null) {
			return [...importDeclarations, createAliasedBinding(importedSymbol, importedSymbol.propertyName, typescript)];
		}

		// If a namespace is imported, create a type literal under the same name as the namespace binding
		if ("namespaceImport" in importedSymbol) {
			const namedExportsForModule = getAllNamedExportsForModule(importedSymbol.originalModule, sourceFileToExportedSymbolSet);
			return [
				...importDeclarations,
				typescript.createModuleDeclaration(
					undefined,
					ensureHasDeclareModifier([], typescript),
					typescript.createIdentifier(importedSymbol.name),
					typescript.createModuleBlock(
						namedExportsForModule.map(namedExport => {
							return cloneNode(namedExport.node, {
								hook: {
									modifiers: modifiers => removeExportAndDeclareModifiers(modifiers, typescript)
								}
							}) as TS.Statement;
						})
					),
					typescript.NodeFlags.Namespace
				)
			];
		}

		// Otherwise, leave out the import as it will be part of the merged local declarations already,
		else {
			return importDeclarations;
		}
	}

	// If the whole namespace is imported, just add a namespace import and do no more
	if ("namespaceImport" in importedSymbol) {
		return [
			...importDeclarations,
			typescript.createImportDeclaration(
				undefined,
				undefined,
				typescript.createImportClause(undefined, typescript.createNamespaceImport(typescript.createIdentifier(importedSymbol.name))),
				typescript.createStringLiteral(moduleSpecifier)
			)
		];
	}

	// Otherwise, if it is a default import, add an ImportDeclaration that imports the default binding under whatever name is given
	else if ("defaultImport" in importedSymbol && importedSymbol.defaultImport) {
		return [
			...importDeclarations,
			typescript.createImportDeclaration(
				undefined,
				undefined,
				typescript.createImportClause(typescript.createIdentifier(importedSymbol.name), undefined),
				typescript.createStringLiteral(moduleSpecifier)
			)
		];
	}

	// Otherwise, it may be as easy as adding an import with NamedImports pointing to an ImportSpecifier pointing to
	// one of the named exports of the other module. However, that named export may have been renamed and given another binding name
	else {
		const {name, propertyName} = importedSymbol;
		if (otherModuleLocalSymbols != null) {
			const match = otherModuleLocalSymbols.get(propertyName ?? name);
			const actualPropertyName = propertyName ?? name;

			if (match != null) {
				return [
					...importDeclarations,
					typescript.createImportDeclaration(
						undefined,
						undefined,
						typescript.createImportClause(
							undefined,
							typescript.createNamedImports([
								typescript.createImportSpecifier(
									actualPropertyName === name ? undefined : typescript.createIdentifier(actualPropertyName),
									typescript.createIdentifier(name)
								)
							])
						),
						typescript.createStringLiteral(moduleSpecifier)
					)
				];
			}
		}

		// If no exported symbol could be found, assume that the import binding is OK as it is
		return [
			...importDeclarations,
			typescript.createImportDeclaration(
				undefined,
				undefined,
				typescript.createImportClause(
					undefined,
					typescript.createNamedImports([
						typescript.createImportSpecifier(
							propertyName == null || propertyName === name ? undefined : typescript.createIdentifier(propertyName),
							typescript.createIdentifier(name)
						)
					])
				),
				typescript.createStringLiteral(moduleSpecifier)
			)
		];
	}
}
