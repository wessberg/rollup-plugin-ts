import {createIdentifier, createImportClause, createImportDeclaration, createImportSpecifier, createNamedImports, createNamespaceImport, createStringLiteral, createTypeAliasDeclaration, createTypeQueryNode, createTypeReferenceNode, createVariableDeclaration, createVariableDeclarationList, createVariableStatement, ImportDeclaration, NodeFlags, SyntaxKind, TypeAliasDeclaration, VariableStatement} from "typescript";
import {dirname, relative} from "path";
import {ensureHasLeadingDotAndPosix, stripKnownExtension} from "../../../../../util/path/path-util";
import {SupportedExtensions} from "../../../../../util/get-supported-extensions/get-supported-extensions";
import {ChunkToOriginalFileMap} from "../../../../../util/chunk/get-chunk-to-original-file-map";
import {ImportedSymbol, NamedImportedSymbol, SourceFileToLocalSymbolMap} from "../../../declaration-pre-bundler/declaration-pre-bundler-options";
import {getChunkFilename} from "../../../declaration-pre-bundler/util/get-chunk-filename/get-chunk-filename";
import {ensureHasDeclareModifier} from "../../../declaration-pre-bundler/util/modifier/modifier-util";

export interface VisitImportedSymbolOptions {
	sourceFileToLocalSymbolMap: SourceFileToLocalSymbolMap;
	importedSymbol: ImportedSymbol;
	supportedExtensions: SupportedExtensions;
	chunkToOriginalFileMap: ChunkToOriginalFileMap;
	relativeChunkFileName: string;
	absoluteChunkFileName: string;
}

export function createAliasedBinding (importedSymbol: NamedImportedSymbol & {propertyName: string}): ImportDeclaration|TypeAliasDeclaration|VariableStatement {
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

export function visitImportedSymbol ({importedSymbol, sourceFileToLocalSymbolMap, supportedExtensions, relativeChunkFileName, absoluteChunkFileName, chunkToOriginalFileMap}: VisitImportedSymbolOptions): undefined|ImportDeclaration|TypeAliasDeclaration|VariableStatement {
	const otherChunkFileName = getChunkFilename(importedSymbol.originalModule, supportedExtensions, chunkToOriginalFileMap);

	// Generate a module specifier that points to the referenced module, relative to the current sourcefile
	const relativeToSourceFileDirectory = importedSymbol.isExternal && importedSymbol.rawModuleSpecifier != null ? importedSymbol.rawModuleSpecifier : otherChunkFileName == null ? importedSymbol.originalModule : relative(dirname(relativeChunkFileName), otherChunkFileName.fileName);
	const moduleSpecifier = importedSymbol.isExternal && importedSymbol.rawModuleSpecifier != null ? importedSymbol.rawModuleSpecifier : ensureHasLeadingDotAndPosix(stripKnownExtension(relativeToSourceFileDirectory), false);

	// If the module originates from a file not part of the compilation (such as an external module),
	// always include the import
	if (otherChunkFileName == null || importedSymbol.isExternal) {
		return createImportDeclaration(
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
		);
	}

	// If the import originates from a module within the same chunk, leave out the import as it will be part of the merged local declarations already,
	// unless it is imported under a different alias in which case a type alias should be provided
	if (absoluteChunkFileName === otherChunkFileName.fileName) {

		// Create a TypeAlias that aliases the imported property
		if ("propertyName" in importedSymbol && importedSymbol.propertyName != null) {
			return createAliasedBinding(importedSymbol as NamedImportedSymbol & {propertyName: string});
		}

		// The binding will be part of the merged local declarations already and needs no changes
		else {
			return undefined;
		}
	}

	// Find the local symbols for the referenced module
	const otherModuleLocalSymbols = sourceFileToLocalSymbolMap.get(importedSymbol.originalModule);



	// If the whole namespace is imported, just add a namespace import and do no more
	if ("namespaceImport" in importedSymbol) {
		return createImportDeclaration(
			undefined,
			undefined,
			createImportClause(
				undefined,
				createNamespaceImport(createIdentifier(importedSymbol.name))
			),
			createStringLiteral(moduleSpecifier)
		);
	}

	// Otherwise, if it is a default import, add an ImportDeclaration that imports the default binding under whatever name is given
	else if ("defaultImport" in importedSymbol && importedSymbol.defaultImport) {

		return createImportDeclaration(
			undefined,
			undefined,
			createImportClause(createIdentifier(importedSymbol.name), undefined),
			createStringLiteral(moduleSpecifier)
		);
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
				return createImportDeclaration(
					undefined,
					undefined,
					createImportClause(undefined, createNamedImports([
						createImportSpecifier(
							deconflictedPropertyName === name ? undefined : createIdentifier(deconflictedPropertyName),
							createIdentifier(name)
						)
					])),
					createStringLiteral(moduleSpecifier)
				);
			}
		}

		// If no exported symbol could be found, assume that the import binding is OK as it is
		return createImportDeclaration(
			undefined,
			undefined,
			createImportClause(undefined, createNamedImports([
				createImportSpecifier(
					propertyName == null || propertyName === name ? undefined : createIdentifier(propertyName),
					createIdentifier(name)
				)
			])),
			createStringLiteral(moduleSpecifier)
		);
	}
}