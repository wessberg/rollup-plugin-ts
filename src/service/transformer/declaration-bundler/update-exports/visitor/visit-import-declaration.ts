import {
	createIdentifier,
	createModifier,
	createModuleBlock,
	createModuleDeclaration,
	createNodeArray,
	createStringLiteral,
	createTypeAliasDeclaration,
	createTypeQueryNode,
	createTypeReferenceNode,
	createVariableDeclaration,
	createVariableDeclarationList,
	createVariableStatement,
	ImportDeclaration,
	isNamedImports,
	isNamespaceImport,
	isStringLiteralLike,
	ModuleDeclaration,
	NodeFlags,
	SyntaxKind,
	TypeAliasDeclaration,
	updateImportDeclaration,
	VariableStatement
} from "typescript";
import {normalizeModuleSpecifier} from "../../util/module-specifier/normalize-module-specifier";
import {UpdateExportsVisitorOptions} from "../update-exports-visitor-options";
import {dirname, join} from "path";
import {setExtension} from "../../../../../util/path/path-util";
import {removeExportModifier} from "../../util/modifier/modifier-util";

function createTypeAliasOrVariableStatementForIdentifier(identifier: string, kind: SyntaxKind, name: string): VariableStatement | TypeAliasDeclaration {
	switch (kind) {
		case SyntaxKind.ClassDeclaration:
		case SyntaxKind.ClassExpression: {
			return createVariableStatement(
				[createModifier(SyntaxKind.DeclareKeyword)],
				createVariableDeclarationList([createVariableDeclaration(name, createTypeQueryNode(createIdentifier(identifier)))], NodeFlags.Const)
			);
		}

		case SyntaxKind.TypeAliasDeclaration:
		case SyntaxKind.InterfaceDeclaration:
		case SyntaxKind.EnumDeclaration: {
			return createTypeAliasDeclaration(undefined, [createModifier(SyntaxKind.DeclareKeyword)], name, undefined, createTypeReferenceNode(identifier, undefined));
		}

		case SyntaxKind.FunctionDeclaration:
		case SyntaxKind.FunctionExpression:
		case SyntaxKind.VariableDeclaration:
		default: {
			return createVariableStatement(
				[createModifier(SyntaxKind.DeclareKeyword)],
				createVariableDeclarationList([createVariableDeclaration(name, undefined, createIdentifier(identifier))], NodeFlags.Const)
			);
		}
	}
}

/**
 * Visits the given ImportDeclaration.
 * @param {UpdateExportsVisitorOptions<ImportDeclaration>} options
 * @returns {ImportDeclaration | VariableStatement | TypeAliasDeclaration | undefined}
 */
export function visitImportDeclaration({
	node,
	sourceFile,
	supportedExtensions,
	absoluteOutFileName,
	relativeOutFileName,
	chunkToOriginalFileMap,
	identifiersForDefaultExportsForModules,
	parsedExportedSymbolsMap,
	getParsedExportedSymbolsForModule
}: UpdateExportsVisitorOptions<ImportDeclaration>): ImportDeclaration | VariableStatement | TypeAliasDeclaration | (TypeAliasDeclaration | VariableStatement | ModuleDeclaration)[] | undefined {
	const specifier = node.moduleSpecifier;
	if (specifier == null || !isStringLiteralLike(specifier)) return node;

	// Potentially rewrite the ModuleSpecifier text to refer to one of the generated chunk filenames (which may not be the same or named the same)
	const {isSameChunk, hasChanged, normalizedModuleSpecifier} = normalizeModuleSpecifier({
		supportedExtensions,
		specifier: specifier.text,
		sourceFile,
		chunkToOriginalFileMap,
		absoluteOutFileName,
		relativeOutFileName
	});

	// If it imports from the same chunk, don't include the import unless it includes a default export from another module in which case it should be written to a VariableStatement.
	if (isSameChunk) {
		if (node.importClause != null) {
			const newNodes: (TypeAliasDeclaration | VariableStatement | ModuleDeclaration)[] = [];
			let parsedExportedSymbolsPath: string | undefined;
			let identifiersForDefaultExportsForModulesPath: string | undefined;

			for (const extension of ["", ...supportedExtensions]) {
				const path = extension === "" ? join(dirname(sourceFile.fileName), specifier.text) : setExtension(join(dirname(sourceFile.fileName), specifier.text), extension);
				if (parsedExportedSymbolsMap.has(path)) {
					parsedExportedSymbolsPath = path;
				}

				if (identifiersForDefaultExportsForModules.has(path)) {
					identifiersForDefaultExportsForModulesPath = path;
				}
			}

			// If it imports a default export from the same chunk, this will have been rewritten to a named export. Create a variable statement instead that aliases it
			if (node.importClause.name != null && identifiersForDefaultExportsForModulesPath != null) {
				const [identifier, kind] = identifiersForDefaultExportsForModules.get(identifiersForDefaultExportsForModulesPath)!;

				// If the name of the identifier is identical to that of the import, it is already in the scope with the correct name. Leave it be
				if (identifier !== node.importClause.name.text) {
					newNodes.push(createTypeAliasOrVariableStatementForIdentifier(identifier, kind, node.importClause.name.text));
				}
			}

			// Also check for aliased import bindings
			if (node.importClause.namedBindings != null && parsedExportedSymbolsPath != null) {
				const specifiers = getParsedExportedSymbolsForModule(parsedExportedSymbolsPath);

				if (isNamedImports(node.importClause.namedBindings)) {
					for (const element of node.importClause.namedBindings.elements) {
						if (element.propertyName != null && specifiers.has(element.propertyName.text)) {
							const propertyNode = specifiers.get(element.propertyName.text)!;
							newNodes.push(createTypeAliasOrVariableStatementForIdentifier(element.propertyName.text, propertyNode.kind, element.name.text));
						}
					}
				}

				// If it is a namespace import, then create an inlined namespace containing clones of all the imported nods
				else if (isNamespaceImport(node.importClause.namedBindings)) {
					newNodes.push(
						createModuleDeclaration(
							undefined,
							[createModifier(SyntaxKind.DeclareKeyword)],
							createIdentifier(node.importClause.namedBindings.name.text),
							// Ensure that none of them have export modifiers
							createModuleBlock(
								[...specifiers.values()].map(specifierNode => {
									const clone = {...specifierNode};
									clone.modifiers = createNodeArray(removeExportModifier(clone.modifiers));
									return clone;
								})
							)
						)
					);
				}
			}

			// If nodes have been added, return them
			if (newNodes.length > 0) return newNodes;
		}
		return undefined;
	}

	// Update the ModuleSpecifier to point to the updated chunk filename, unless it didn't change at all
	else {
		if (hasChanged) {
			return updateImportDeclaration(node, node.decorators, node.modifiers, node.importClause, createStringLiteral(normalizedModuleSpecifier));
		}

		// Otherwise, return the node as it was
		else {
			return node;
		}
	}
}
