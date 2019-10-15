import {
	ClassDeclaration,
	ClassExpression,
	createClassDeclaration,
	createClassExpression,
	createExpressionWithTypeArguments,
	createHeritageClause,
	createIdentifier,
	createImportClause,
	createImportDeclaration,
	createImportSpecifier,
	createModifier,
	createModuleBlock,
	createModuleDeclaration,
	createNamedImports,
	createNodeArray,
	createStringLiteral,
	createTypeAliasDeclaration,
	createTypeReferenceNode,
	createVariableDeclaration,
	createVariableDeclarationList,
	createVariableStatement,
	ImportDeclaration,
	ImportSpecifier,
	InterfaceDeclaration,
	isNamedImports,
	isNamespaceImport,
	isStringLiteralLike,
	ModuleDeclaration,
	Node,
	NodeFlags,
	SyntaxKind,
	TypeAliasDeclaration,
	updateImportDeclaration,
	VariableStatement
} from "typescript";
import {normalizeModuleSpecifier} from "../../util/module-specifier/normalize-module-specifier";
import {UpdateExportsVisitorOptions} from "../update-exports-visitor-options";
import {dirname, join, normalize} from "path";
import {setExtension} from "../../../../../util/path/path-util";
import {removeDeclareModifier, removeExportModifier} from "../../util/modifier/modifier-util";

function createTypeAliasOrVariableStatementForIdentifier(
	identifier: string,
	identifierNode: Node,
	name: string
): VariableStatement | TypeAliasDeclaration | ClassDeclaration | ClassExpression {
	switch (identifierNode.kind) {
		case SyntaxKind.ClassDeclaration: {
			const classDeclaration = identifierNode as ClassDeclaration;
			return createClassDeclaration(
				undefined,
				[createModifier(SyntaxKind.DeclareKeyword)],
				name,
				classDeclaration.typeParameters == null ? undefined : [...classDeclaration.typeParameters],
				[
					createHeritageClause(SyntaxKind.ExtendsKeyword, [
						createExpressionWithTypeArguments(
							classDeclaration.typeParameters == null
								? undefined
								: classDeclaration.typeParameters.map(param => createTypeReferenceNode(param.name, undefined)),
							createIdentifier(identifier)
						)
					])
				],
				[]
			);
		}

		case SyntaxKind.ClassExpression: {
			const classExpression = identifierNode as ClassExpression;
			return createClassExpression(
				[createModifier(SyntaxKind.DeclareKeyword)],
				name,
				classExpression.typeParameters == null ? undefined : [...classExpression.typeParameters],
				[
					createHeritageClause(SyntaxKind.ExtendsKeyword, [
						createExpressionWithTypeArguments(
							classExpression.typeParameters == null
								? undefined
								: classExpression.typeParameters.map(param => createTypeReferenceNode(param.name, undefined)),
							createIdentifier(identifier)
						)
					])
				],
				[]
			);
		}

		case SyntaxKind.TypeAliasDeclaration:
		case SyntaxKind.InterfaceDeclaration: {
			const declaration = identifierNode as TypeAliasDeclaration | InterfaceDeclaration;
			return createTypeAliasDeclaration(
				undefined,
				[createModifier(SyntaxKind.DeclareKeyword)],
				name,
				declaration.typeParameters == null ? undefined : [...declaration.typeParameters],
				createTypeReferenceNode(
					identifier,
					declaration.typeParameters == null ? undefined : declaration.typeParameters.map(param => createTypeReferenceNode(param.name, undefined))
				)
			);
		}

		case SyntaxKind.EnumDeclaration: {
			return createTypeAliasDeclaration(
				undefined,
				[createModifier(SyntaxKind.DeclareKeyword)],
				name,
				undefined,
				createTypeReferenceNode(identifier, undefined)
			);
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
	getParsedExportedSymbolsForModule,
	getExportsFromExternalModulesForModule
}: UpdateExportsVisitorOptions<ImportDeclaration>):
	| ImportDeclaration
	| VariableStatement
	| TypeAliasDeclaration
	| (TypeAliasDeclaration | ImportDeclaration | VariableStatement | ModuleDeclaration | ClassDeclaration | ClassExpression)[]
	| undefined {
	const specifier = node.moduleSpecifier;
	if (specifier == null || !isStringLiteralLike(specifier)) return node;

	// Potentially rewrite the ModuleSpecifier text to refer to one of the generated chunk filenames (which may not be the same or named the same)
	const {isSameChunk, hasChanged, normalizedModuleSpecifier, absoluteModuleSpecifier} = normalizeModuleSpecifier({
		supportedExtensions,
		specifier: specifier.text,
		sourceFile,
		chunkToOriginalFileMap,
		absoluteOutFileName,
		relativeOutFileName
	});

	// If it imports from the same chunk, don't include the import unless it includes a default
	// export from another module in which case it should be written to a VariableStatement.
	if (isSameChunk) {
		if (node.importClause != null) {
			const externalModuleExports = getExportsFromExternalModulesForModule(absoluteModuleSpecifier);
			let updatedNameImport: ImportDeclaration | undefined;
			let updatedNamedImportsImport: ImportDeclaration | undefined;

			for (const [moduleName, exportDeclaration] of externalModuleExports.entries()) {
				// If default import AND the referenced file exports *anything* from an external library as default, then import directly from that one
				if (node.importClause.name != null) {
					if (exportDeclaration.exportClause == null) continue;

					// This may be something like 'export {Foo as default}' or even 'export {default'}
					const defaultNamedExport = exportDeclaration.exportClause.elements.find(element => element.name.text === "default");
					if (defaultNamedExport == null) continue;

					const name = createIdentifier(node.importClause.name.text);

					const propertyName =
						defaultNamedExport.propertyName == null ? createIdentifier("default") : createIdentifier(defaultNamedExport.propertyName.text);

					updatedNameImport = createImportDeclaration(
						undefined,
						undefined,
						createImportClause(
							undefined,
							createNamedImports([createImportSpecifier(name.text === propertyName.text ? undefined : propertyName, name)])
						),
						createStringLiteral(moduleName)
					);
				}

				if (node.importClause.namedBindings != null) {
					if (!isNamespaceImport(node.importClause.namedBindings)) {
						if (exportDeclaration.exportClause == null) continue;
						const newImportSpecifiers: ImportSpecifier[] = [];

						for (const namedImport of node.importClause.namedBindings.elements) {
							// This may be something like 'export {Foo}' or even 'export {default as Foo}'}
							const matchingNamedExport = exportDeclaration.exportClause.elements.find(element => element.name.text === namedImport.name.text);
							if (matchingNamedExport == null) continue;

							const name = createIdentifier(namedImport.name.text);

							const propertyName =
								matchingNamedExport.propertyName == null
									? createIdentifier(namedImport.name.text)
									: createIdentifier(matchingNamedExport.propertyName.text);

							newImportSpecifiers.push(createImportSpecifier(name.text === propertyName.text ? undefined : propertyName, name));
						}

						if (newImportSpecifiers.length < 1) continue;

						updatedNamedImportsImport = createImportDeclaration(
							undefined,
							undefined,
							createImportClause(undefined, createNamedImports(newImportSpecifiers)),
							createStringLiteral(moduleName)
						);
					} else {
						// We do not yet support Namespaces since this will require merging the namespace of the local declarations of the other file
						// with whatever it is re-exporting from an external library
					}
				}
			}

			const newNodes: (TypeAliasDeclaration | VariableStatement | ModuleDeclaration | ClassDeclaration | ClassExpression)[] = [];
			let parsedExportedSymbolsPath: string | undefined;
			let identifiersForDefaultExportsForModulesPath: string | undefined;

			for (const extension of ["", ...supportedExtensions]) {
				const path =
					extension === ""
						? join(dirname(normalize(sourceFile.fileName)), specifier.text)
						: setExtension(join(dirname(normalize(sourceFile.fileName)), specifier.text), extension);
				if (parsedExportedSymbolsMap.has(path)) {
					parsedExportedSymbolsPath = path;
				}

				if (identifiersForDefaultExportsForModules.has(path)) {
					identifiersForDefaultExportsForModulesPath = path;
				}
			}

			// If it imports a default export from the same chunk, this will have been rewritten to a named export. Create a variable statement instead that aliases it
			if (node.importClause.name != null && identifiersForDefaultExportsForModulesPath != null) {
				const [identifier, identifierNode] = identifiersForDefaultExportsForModules.get(identifiersForDefaultExportsForModulesPath)!;

				// If the name of the identifier is identical to that of the import, it is already in the scope with the correct name. Leave it be
				if (identifier !== node.importClause.name.text) {
					newNodes.push(createTypeAliasOrVariableStatementForIdentifier(identifier, identifierNode, node.importClause.name.text));
				}
			}

			// Also check for aliased import bindings
			if (node.importClause.namedBindings != null && parsedExportedSymbolsPath != null) {
				const specifiers = getParsedExportedSymbolsForModule(parsedExportedSymbolsPath);

				if (isNamedImports(node.importClause.namedBindings)) {
					for (const element of node.importClause.namedBindings.elements) {
						if (element.propertyName != null && specifiers.has(element.propertyName.text)) {
							const propertyNode = specifiers.get(element.propertyName.text)!;
							newNodes.push(createTypeAliasOrVariableStatementForIdentifier(element.propertyName.text, propertyNode, element.name.text));
						}
					}
				}

				// If it is a namespace import, then create an inlined namespace containing clones of all the imported nodes
				else if (isNamespaceImport(node.importClause.namedBindings)) {
					newNodes.push(
						createModuleDeclaration(
							undefined,
							[createModifier(SyntaxKind.DeclareKeyword)],
							createIdentifier(node.importClause.namedBindings.name.text),
							// Ensure that none of them have export- or declare modifiers
							createModuleBlock(
								[...specifiers.values()].map(specifierNode => {
									const clone = {...specifierNode};
									clone.modifiers = createNodeArray(removeDeclareModifier(removeExportModifier(clone.modifiers)));
									return clone;
								})
							)
						)
					);
				}
			}

			// If nodes have been added, return them
			if (newNodes.length > 0 || updatedNamedImportsImport != null || updatedNameImport != null) {
				return [
					...newNodes,
					...(updatedNameImport != null ? [updatedNameImport] : []),
					...(updatedNamedImportsImport != null ? [updatedNamedImportsImport] : [])
				];
			}
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
