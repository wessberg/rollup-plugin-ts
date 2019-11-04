import {createIdentifier, createImportClause, createImportDeclaration, createImportSpecifier, createNamedImports, createNamespaceImport, createPropertySignature, createStringLiteral, createTypeAliasDeclaration, createTypeLiteralNode, createTypeQueryNode, createTypeReferenceNode, createVariableDeclaration, createVariableDeclarationList, createVariableStatement, ImportDeclaration, NodeFlags, SyntaxKind, TypeAliasDeclaration, TypeQueryNode, TypeReferenceNode, VariableStatement} from "typescript";
import {dirname, relative} from "path";
import {ensureHasLeadingDotAndPosix, stripKnownExtension} from "../../../../../util/path/path-util";
import {SupportedExtensions} from "../../../../../util/get-supported-extensions/get-supported-extensions";
import {ChunkToOriginalFileMap} from "../../../../../util/chunk/get-chunk-to-original-file-map";
import {ImportedSymbol, NamedExportedSymbol, NamedImportedSymbol, SourceFileToExportedSymbolSet, SourceFileToLocalSymbolMap} from "../../../declaration-pre-bundler/declaration-pre-bundler-options";
import {getChunkFilename} from "../../../declaration-pre-bundler/util/get-chunk-filename/get-chunk-filename";
import {ensureHasDeclareModifier} from "../../../declaration-pre-bundler/util/modifier/modifier-util";

export interface VisitImportedSymbolOptions {
	sourceFileToLocalSymbolMap: SourceFileToLocalSymbolMap;
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	importedSymbol: ImportedSymbol;
	supportedExtensions: SupportedExtensions;
	chunkToOriginalFileMap: ChunkToOriginalFileMap;
	relativeChunkFileName: string;
	absoluteChunkFileName: string;
}

export function createAliasedBinding (importedSymbol: NamedImportedSymbol&{ propertyName: string }): ImportDeclaration|TypeAliasDeclaration|VariableStatement {
	switch (importedSymbol.node.kind) {
		case SyntaxKind.ClassDeclaration:
		case SyntaxKind.ClassExpression:
		case SyntaxKind.FunctionDeclaration:
		case SyntaxKind.FunctionExpression:
		case SyntaxKind.EnumDeclaration:
		case SyntaxKind.VariableDeclaration:
		case SyntaxKind.VariableStatement: {
			return createVariableStatement(
				ensureHasDeclareModifier(undefined),
				createVariableDeclarationList([
					createVariableDeclaration(
						createIdentifier(importedSymbol.name),
						createTypeQueryNode(createIdentifier(importedSymbol.propertyName))
					)
				], NodeFlags.Const)
			);
		}

		default: {
			return createTypeAliasDeclaration(
				undefined,
				undefined,
				createIdentifier(importedSymbol.name),
				undefined,
				createTypeReferenceNode(createIdentifier(importedSymbol.propertyName), undefined)
			);
		}
	}
}

export function createTypeReferenceOrTypeQueryBasedOnNode (exportedSymbol: NamedExportedSymbol): TypeReferenceNode|TypeQueryNode {
	switch (exportedSymbol.node.kind) {
		case SyntaxKind.ClassDeclaration:
		case SyntaxKind.ClassExpression:
		case SyntaxKind.FunctionDeclaration:
		case SyntaxKind.FunctionExpression:
		case SyntaxKind.EnumDeclaration:
		case SyntaxKind.VariableDeclaration:
		case SyntaxKind.VariableStatement: {
			return createTypeQueryNode(
				createIdentifier(exportedSymbol.name)
			);
		}

		default: {
			return createTypeReferenceNode(
				createIdentifier(exportedSymbol.name),
				undefined
			);
		}
	}
}

function getAllNamedExportsForModule (moduleName: string, sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet): NamedExportedSymbol[] {
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

export function visitImportedSymbol ({importedSymbol, sourceFileToExportedSymbolSet, sourceFileToLocalSymbolMap, supportedExtensions, relativeChunkFileName, absoluteChunkFileName, chunkToOriginalFileMap}: VisitImportedSymbolOptions): (ImportDeclaration|TypeAliasDeclaration|VariableStatement)[] {
	const otherChunkFileName = getChunkFilename(importedSymbol.originalModule, supportedExtensions, chunkToOriginalFileMap);
	const importDeclarations: (ImportDeclaration|TypeAliasDeclaration)[] = [];

	// Generate a module specifier that points to the referenced module, relative to the current sourcefile
	const relativeToSourceFileDirectory = importedSymbol.isExternal && importedSymbol.rawModuleSpecifier != null ? importedSymbol.rawModuleSpecifier : otherChunkFileName == null ? importedSymbol.originalModule : relative(dirname(relativeChunkFileName), otherChunkFileName.fileName);
	const moduleSpecifier = importedSymbol.isExternal && importedSymbol.rawModuleSpecifier != null ? importedSymbol.rawModuleSpecifier : ensureHasLeadingDotAndPosix(stripKnownExtension(relativeToSourceFileDirectory), false);

	// Find the local symbols for the referenced module
	const otherModuleLocalSymbols = sourceFileToLocalSymbolMap.get(importedSymbol.originalModule);

	// Find the exported symbols for the referenced module
	const otherModuleExportedSymbols = sourceFileToExportedSymbolSet.get(importedSymbol.originalModule);

	// If the module originates from a file not part of the compilation (such as an external module),
	// always include the import
	if (otherChunkFileName == null || importedSymbol.isExternal) {
		return [
			...importDeclarations,
			createImportDeclaration(
			undefined,
			undefined,
			createImportClause(
				"defaultImport" in importedSymbol && importedSymbol.defaultImport ? createIdentifier(importedSymbol.name) : undefined,
				"namespaceImport" in importedSymbol
					? createNamespaceImport(createIdentifier(importedSymbol.name))
					: createNamedImports([
						createImportSpecifier(
							importedSymbol.propertyName != null
								? createIdentifier(importedSymbol.propertyName)
								: undefined,
							createIdentifier(importedSymbol.name)
						)
					])
			),
			createStringLiteral(moduleSpecifier)
		)
		];
	}

	// If the import originates from a module within the same chunk,
	if (absoluteChunkFileName === otherChunkFileName.fileName) {

		// Most likely, the import should be left out, given that the symbol
		// might already be part of the chunk. But, it may also be something like 'export {...} from "..."'
		// in which case *that* might be part of a different chunk (or none at all).
		if (otherModuleExportedSymbols != null) {
			const propertyName = "propertyName" in importedSymbol && importedSymbol.propertyName != null ? importedSymbol.propertyName : importedSymbol.name;
			const matchingExportedSymbol = [...otherModuleExportedSymbols].find(exportedSymbol =>
				"defaultImport" in importedSymbol && importedSymbol.defaultImport
					? "defaultExport" in exportedSymbol && exportedSymbol.defaultExport
					: !("namespaceExport" in exportedSymbol) && exportedSymbol.name === propertyName
		);

			if (matchingExportedSymbol != null) {
				const matchingExportedSymbolChunk = getChunkFilename(matchingExportedSymbol.originalModule, supportedExtensions, chunkToOriginalFileMap);

				// If the chunk in which the exported binding resides isn't part of the same chunk, import the binding into the current module
				if (matchingExportedSymbolChunk == null || matchingExportedSymbol.isExternal || absoluteChunkFileName !== matchingExportedSymbolChunk.fileName) {

					const otherRelativeToSourceFileDirectory = matchingExportedSymbol.isExternal && matchingExportedSymbol.rawModuleSpecifier != null ? matchingExportedSymbol.rawModuleSpecifier : relative(dirname(importedSymbol.originalModule), matchingExportedSymbol.originalModule);
					const otherUpdatedModuleSpecifierText = matchingExportedSymbol.isExternal && matchingExportedSymbol.rawModuleSpecifier != null ? matchingExportedSymbol.rawModuleSpecifier : ensureHasLeadingDotAndPosix(stripKnownExtension(otherRelativeToSourceFileDirectory), false);

					importDeclarations.push(
						createImportDeclaration(
							undefined,
							undefined,
							createImportClause(
								"defaultExport" in matchingExportedSymbol && matchingExportedSymbol.defaultExport ? createIdentifier(importedSymbol.name) : undefined,
								"namespaceExport" in matchingExportedSymbol
									? createNamespaceImport(createIdentifier(importedSymbol.name))
									: "defaultExport" in matchingExportedSymbol && matchingExportedSymbol.defaultExport ? undefined : createNamedImports([
										createImportSpecifier(
											matchingExportedSymbol.propertyName != null
												? createIdentifier(matchingExportedSymbol.propertyName)
												: undefined,
											createIdentifier(importedSymbol.name)
										)
									])
							),
							createStringLiteral(otherUpdatedModuleSpecifierText)
						)
					);
				}
			}

		}

		// Create a TypeAlias that aliases the imported property
		if ("propertyName" in importedSymbol && importedSymbol.propertyName != null) {
			return [
				...importDeclarations,
				createAliasedBinding(importedSymbol as NamedImportedSymbol&{ propertyName: string })
			];
		}

		// If a namespace is imported, create a type literal under the same name as the namespace binding
		if ("namespaceImport" in importedSymbol) {
			const namedExportsForModule = getAllNamedExportsForModule(importedSymbol.originalModule, sourceFileToExportedSymbolSet);
			return [
				...importDeclarations,
				createTypeAliasDeclaration(
					undefined,
					undefined,
					createIdentifier(importedSymbol.name),
					undefined,
					createTypeLiteralNode(namedExportsForModule.map(namedExport => createPropertySignature(
						undefined,
						createIdentifier(namedExport.name),
						undefined,
						createTypeReferenceOrTypeQueryBasedOnNode(namedExport),
						undefined
					)))
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
			createImportDeclaration(
				undefined,
				undefined,
				createImportClause(
					undefined,
					createNamespaceImport(createIdentifier(importedSymbol.name))
				),
				createStringLiteral(moduleSpecifier)
			)
		];
	}

	// Otherwise, if it is a default import, add an ImportDeclaration that imports the default binding under whatever name is given
	else if ("defaultImport" in importedSymbol && importedSymbol.defaultImport) {

		return [
			...importDeclarations,
			createImportDeclaration(
				undefined,
				undefined,
				createImportClause(createIdentifier(importedSymbol.name), undefined),
				createStringLiteral(moduleSpecifier)
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
			const deconflictedPropertyName = match == null ? actualPropertyName : match.deconflictedName ?? actualPropertyName;

			if (match != null) {
				return [
					...importDeclarations,
					createImportDeclaration(
						undefined,
						undefined,
						createImportClause(undefined, createNamedImports([
							createImportSpecifier(
								deconflictedPropertyName === name ? undefined : createIdentifier(deconflictedPropertyName),
								createIdentifier(name)
							)
						])),
						createStringLiteral(moduleSpecifier)
					)
				];
			}
		}

		// If no exported symbol could be found, assume that the import binding is OK as it is
		return [
			...importDeclarations,
			createImportDeclaration(
				undefined,
				undefined,
				createImportClause(undefined, createNamedImports([
					createImportSpecifier(
						propertyName == null || propertyName === name ? undefined : createIdentifier(propertyName),
						createIdentifier(name)
					)
				])),
				createStringLiteral(moduleSpecifier)
			)
		];
	}
}