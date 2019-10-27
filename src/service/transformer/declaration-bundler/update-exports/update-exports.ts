import {
	createExportDeclaration,
	createExportSpecifier,
	createIdentifier,
	createNamedExports,
	createPrinter,
	ExportDeclaration,
	isClassDeclaration,
	isEnumDeclaration,
	isExportAssignment,
	isExportDeclaration,
	isFunctionDeclaration,
	isImportDeclaration,
	isImportTypeNode,
	isInterfaceDeclaration,
	isModuleDeclaration,
	isTypeAliasDeclaration,
	isVariableStatement,
	Node,
	SourceFile,
	Statement,
	TransformerFactory,
	updateSourceFileNode,
	visitEachChild
} from "typescript";
import {IDeclarationBundlerOptions, SourceFileToExportedSymbolMap} from "../i-declaration-bundler-options";
import {getChunkFilename} from "../util/get-chunk-filename/get-chunk-filename";
import {visitExportDeclaration} from "./visitor/visit-export-declaration";
import {visitExportAssignment} from "./visitor/visit-export-assignment";
import {visitImportDeclaration} from "./visitor/visit-import-declaration";
import {visitImportTypeNode} from "./visitor/visit-import-type-node";
import {visitVariableStatement} from "./visitor/visit-variable-statement";
import {visitFunctionDeclaration} from "./visitor/visit-function-declaration";
import {visitTypeAliasDeclaration} from "./visitor/visit-type-alias-declaration";
import {visitClassDeclaration} from "./visitor/visit-class-declaration";
import {visitEnumDeclaration} from "./visitor/visit-enum-declaration";
import {visitInterfaceDeclaration} from "./visitor/visit-interface-declaration";
import {visitModuleDeclaration} from "./visitor/visit-module-declaration";
import {setExtension} from "../../../../util/path/path-util";
import {extname, join, normalize} from "path";

export function updateExports({usedExports, ...rest}: IDeclarationBundlerOptions): TransformerFactory<SourceFile> {
	const sourceFileToExportedSymbolMap: SourceFileToExportedSymbolMap = new Map();

	const parsedExportedSymbolsMap: Map<string, Map<string, [string | undefined, Statement]>> = new Map();
	const exportedSpecifiersFromModuleMap: Map<string, Set<string>> = new Map();
	const exportsFromExternalModulesMap: Map<string, Map<string, ExportDeclaration>> = new Map();

	return context => {
		return sourceFile => {
			const sourceFileName = normalize(sourceFile.fileName);

			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (!rest.localModuleNames.includes(sourceFileName)) return updateSourceFileNode(sourceFile, [], true);

			if (rest.pluginOptions.debug) {
				console.log(`=== BEFORE UPDATING EXPORTS === (${sourceFileName})`);
				console.log(createPrinter().printFile(sourceFile));
			}

			const chunkFilename = getChunkFilename(sourceFileName, rest.supportedExtensions, rest.chunkToOriginalFileMap);

			let exportedSymbolMap = sourceFileToExportedSymbolMap.get(sourceFileName);

			let parsedExportedSymbols = parsedExportedSymbolsMap.get(sourceFileName);
			let exportedSpecifiersFromModule = exportedSpecifiersFromModuleMap.get(sourceFileName);
			let exportsFromExternalModules = exportsFromExternalModulesMap.get(sourceFileName);

			if (exportedSymbolMap == null) {
				exportedSymbolMap = new Map();
				sourceFileToExportedSymbolMap.set(sourceFileName, exportedSymbolMap);
			}

			if (parsedExportedSymbols == null) {
				parsedExportedSymbols = new Map();
				parsedExportedSymbolsMap.set(sourceFileName, parsedExportedSymbols);
			}

			if (exportedSpecifiersFromModule == null) {
				exportedSpecifiersFromModule = new Set();
				exportedSpecifiersFromModuleMap.set(sourceFileName, exportedSpecifiersFromModule);
			}

			if (exportsFromExternalModules == null) {
				exportsFromExternalModules = new Map();
				exportsFromExternalModulesMap.set(sourceFileName, exportsFromExternalModules);
			}

			// Prepare some VisitorOptions
			const visitorOptions = {
				usedExports,
				sourceFile,
				parsedExportedSymbolsMap,
				exportsFromExternalModules,
				isEntry: rest.entryFileNames.includes(sourceFileName),
				...rest,
				continuation: <U extends Node>(node: U) => {
					return visitEachChild(node, visitor, context);
				},

				getParsedExportedSymbolsForModule(moduleName: string): Map<string, [string | undefined, Statement]> {
					let matched: Map<string, [string | undefined, Statement]> | undefined;
					let matchedModuleName: string = moduleName;

					const moduleNames = [normalize(moduleName), join(moduleName, "/index")];
					for (const currentModuleName of moduleNames) {
						for (const extension of [extname(moduleName), ...rest.supportedExtensions]) {
							const tryPath = setExtension(currentModuleName, extension);
							matched = parsedExportedSymbolsMap.get(tryPath);
							if (matched != null) {
								matchedModuleName = tryPath;
								break;
							}
						}
						if (matched != null) break;
					}

					if (matched == null) {
						matched = new Map();
						parsedExportedSymbolsMap.set(matchedModuleName, matched);
					}
					return matched;
				},

				getExportsFromExternalModulesForModule(moduleName: string): Map<string, ExportDeclaration> {
					let matched: Map<string, ExportDeclaration> | undefined;
					let matchedModuleName: string = moduleName;

					const moduleNames = [normalize(moduleName), join(moduleName, "/index")];
					for (const currentModuleName of moduleNames) {
						for (const extension of [extname(moduleName), ...rest.supportedExtensions]) {
							const tryPath = setExtension(currentModuleName, extension);
							matched = exportsFromExternalModulesMap.get(tryPath);
							if (matched != null) {
								matchedModuleName = tryPath;
								break;
							}
						}
						if (matched != null) break;
					}

					if (matched == null) {
						matched = new Map();
						exportsFromExternalModulesMap.set(matchedModuleName, matched);
					}
					return matched;
				},

				getExportedSpecifiersFromModule(moduleName: string): Set<string> {
					let matched: Set<string> | undefined;
					let matchedModuleName: string = moduleName;

					const moduleNames = [normalize(moduleName), join(moduleName, "/index")];
					for (const currentModuleName of moduleNames) {
						for (const extension of [extname(moduleName), ...rest.supportedExtensions]) {
							const tryPath = setExtension(currentModuleName, extension);
							matched = exportedSpecifiersFromModuleMap.get(tryPath);
							if (matched != null) {
								matchedModuleName = tryPath;
								break;
							}
						}
						if (matched != null) break;
					}

					if (matched == null) {
						matched = new Set();
						exportedSpecifiersFromModuleMap.set(matchedModuleName, matched);
					}
					return matched;
				},
				parsedExportedSymbols,
				exportedSpecifiersFromModule
			};

			/**
			 * Visits the given Node
			 * @param {Node} node
			 * @returns {Node | undefined}
			 */
			function visitor(node: Node): Node | Node[] | undefined {
				if (isExportDeclaration(node)) {
					return visitExportDeclaration({node, ...visitorOptions});
				} else if (isExportAssignment(node)) return visitExportAssignment({node, ...visitorOptions});
				else if (isImportDeclaration(node)) return visitImportDeclaration({node, ...visitorOptions});
				else if (isImportTypeNode(node)) return visitImportTypeNode({node, ...visitorOptions});
				else if (isVariableStatement(node)) return visitVariableStatement({node, ...visitorOptions});
				else if (isFunctionDeclaration(node)) return visitFunctionDeclaration({node, ...visitorOptions});
				else if (isTypeAliasDeclaration(node)) return visitTypeAliasDeclaration({node, ...visitorOptions});
				else if (isClassDeclaration(node)) return visitClassDeclaration({node, ...visitorOptions});
				else if (isEnumDeclaration(node)) return visitEnumDeclaration({node, ...visitorOptions});
				else if (isInterfaceDeclaration(node)) return visitInterfaceDeclaration({node, ...visitorOptions});
				else if (isModuleDeclaration(node)) return visitModuleDeclaration({node, ...visitorOptions});
				else return visitEachChild(node, visitor, context);
			}

			let updatedSourceFile = visitEachChild(sourceFile, visitor, context);
			const extraStatements: Statement[] = [];

			if (visitorOptions.isEntry || !rest.chunk.isEntry) {
				let missingExportSpecifiers: [string, string | undefined][];

				// If it is a non-entry chunk, ensure that every parsed exported symbol is exported from it
				if (!rest.chunk.isEntry) {
					missingExportSpecifiers = [];
					const modules = rest.chunkToOriginalFileMap.get(chunkFilename);

					if (modules != null) {
						for (const module of modules) {
							missingExportSpecifiers.push(
								...[...visitorOptions.getParsedExportedSymbolsForModule(module).entries()]
									.filter(([symbol]) => !visitorOptions.getExportedSpecifiersFromModule(module).has(symbol))
									.map(([symbol, [propertyName]]) => [symbol, propertyName] as [string, string | undefined])
							);
						}
					}
				} else {
					missingExportSpecifiers = [...visitorOptions.parsedExportedSymbols.entries()]
						.filter(([symbol]) => !visitorOptions.exportedSpecifiersFromModule.has(symbol))
						.map(([symbol, [propertyName]]) => [symbol, propertyName] as [string, string | undefined]);
				}

				if (missingExportSpecifiers.length > 0) {
					// Mark all of them as exported now
					missingExportSpecifiers.forEach(([symbol]) => visitorOptions.exportedSpecifiersFromModule.add(symbol));
					extraStatements.push(
						createExportDeclaration(
							undefined,
							undefined,
							createNamedExports(
								[...missingExportSpecifiers].map(([name, asName]) =>
									asName == null
										? createExportSpecifier(undefined, createIdentifier(name))
										: createExportSpecifier(createIdentifier(name), createIdentifier(asName))
								)
							)
						)
					);
				}
			}

			// Update the SourceFile with the extra statements
			const updated = updateSourceFileNode(
				updatedSourceFile,
				[...updatedSourceFile.statements, ...extraStatements],
				sourceFile.isDeclarationFile,
				sourceFile.referencedFiles,
				sourceFile.typeReferenceDirectives,
				sourceFile.hasNoDefaultLib,
				sourceFile.libReferenceDirectives
			);

			if (rest.pluginOptions.debug) {
				console.log(`=== AFTER UPDATING EXPORTS === (${sourceFileName})`);
				console.log(createPrinter().printFile(updated));
			}

			return updated;
		};
	};
}
