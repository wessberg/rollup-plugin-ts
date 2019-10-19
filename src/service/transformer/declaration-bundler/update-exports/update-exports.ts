import {
	createExportDeclaration,
	createExportSpecifier,
	createNamedExports,
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
import {IDeclarationBundlerOptions} from "../i-declaration-bundler-options";
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
import {ensureHasLeadingDotAndPosix, setExtension} from "../../../../util/path/path-util";
import {join, normalize} from "path";

export function updateExports({usedExports, ...rest}: IDeclarationBundlerOptions): TransformerFactory<SourceFile> {
	const parsedExportedSymbolsMap: Map<string, Map<string, Statement>> = new Map();
	const exportedSpecifiersFromModuleMap: Map<string, Set<string>> = new Map();
	const exportsFromExternalModulesMap: Map<string, Map<string, ExportDeclaration>> = new Map();

	return context => {
		return sourceFile => {
			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (!rest.localModuleNames.includes(normalize(sourceFile.fileName))) return updateSourceFileNode(sourceFile, [], true);

			const chunkFilename = getChunkFilename(normalize(sourceFile.fileName), rest.supportedExtensions, rest.chunkToOriginalFileMap);

			let parsedExportedSymbols = parsedExportedSymbolsMap.get(normalize(sourceFile.fileName));
			let exportedSpecifiersFromModule = exportedSpecifiersFromModuleMap.get(normalize(sourceFile.fileName));
			let exportsFromExternalModules = exportsFromExternalModulesMap.get(normalize(sourceFile.fileName));

			if (parsedExportedSymbols == null) {
				parsedExportedSymbols = new Map();
				parsedExportedSymbolsMap.set(normalize(sourceFile.fileName), parsedExportedSymbols);
			}

			if (exportedSpecifiersFromModule == null) {
				exportedSpecifiersFromModule = new Set();
				exportedSpecifiersFromModuleMap.set(normalize(sourceFile.fileName), exportedSpecifiersFromModule);
			}

			if (exportsFromExternalModules == null) {
				exportsFromExternalModules = new Map();
				exportsFromExternalModulesMap.set(normalize(sourceFile.fileName), exportsFromExternalModules);
			}

			// Prepare some VisitorOptions
			const visitorOptions = {
				usedExports,
				sourceFile,
				parsedExportedSymbolsMap,
				exportsFromExternalModules,
				isEntry: rest.entryFileNames.includes(normalize(sourceFile.fileName)),
				...rest,
				continuation: <U extends Node>(node: U) => {
					return visitEachChild(node, visitor, context);
				},

				getParsedExportedSymbolsForModule(moduleName: string): Map<string, Statement> {
					let matched: Map<string, Statement> | undefined;
					let matchedModuleName: string = moduleName;

					const moduleNames = [normalize(moduleName), join(moduleName, "/index")];
					for (const currentModuleName of moduleNames) {
						for (const extension of rest.supportedExtensions) {
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
						for (const extension of rest.supportedExtensions) {
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
						for (const extension of rest.supportedExtensions) {
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
				if (isExportDeclaration(node)) return visitExportDeclaration({node, ...visitorOptions});
				else if (isExportAssignment(node)) return visitExportAssignment({node, ...visitorOptions});
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
				let missingExportSpecifiers: string[];

				// If it is a non-entry chunk, ensure that every parsed exported symbol is exported from it
				if (!rest.chunk.isEntry) {
					missingExportSpecifiers = [];
					const modules = rest.chunkToOriginalFileMap.get(chunkFilename);

					if (modules != null) {
						for (const module of modules) {
							missingExportSpecifiers.push(
								...[...visitorOptions.getParsedExportedSymbolsForModule(module).keys()].filter(
									symbol => !visitorOptions.getExportedSpecifiersFromModule(module).has(symbol)
								)
							);
						}
					}
				} else {
					missingExportSpecifiers = [...visitorOptions.parsedExportedSymbols.keys()].filter(
						symbol => !visitorOptions.exportedSpecifiersFromModule.has(symbol)
					);
				}

				if (missingExportSpecifiers.length > 0) {
					// Mark all of them as exported now
					missingExportSpecifiers.forEach(missingExportSpecifier => visitorOptions.exportedSpecifiersFromModule.add(missingExportSpecifier));
					extraStatements.push(
						createExportDeclaration(
							undefined,
							undefined,
							createNamedExports(
								[...missingExportSpecifiers].map(exportSymbol => createExportSpecifier(undefined, ensureHasLeadingDotAndPosix(exportSymbol)))
							)
						)
					);
				}
			}

			// Update the SourceFile with the extra statements
			return updateSourceFileNode(
				updatedSourceFile,
				[...updatedSourceFile.statements, ...extraStatements],
				sourceFile.isDeclarationFile,
				sourceFile.referencedFiles,
				sourceFile.typeReferenceDirectives,
				sourceFile.hasNoDefaultLib,
				sourceFile.libReferenceDirectives
			);
		};
	};
}
