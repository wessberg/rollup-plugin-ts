import {isClassDeclaration, isEnumDeclaration, isExportAssignment, isExportDeclaration, isExportSpecifier, isFunctionDeclaration, isInterfaceDeclaration, isModuleDeclaration, isNamedExports, isTypeAliasDeclaration, isVariableStatement, Node, SourceFile, TransformerFactory, updateSourceFileNode, visitEachChild} from "typescript";
import {DeclarationPreBundlerOptions, ExportedSymbol} from "../declaration-pre-bundler-options";
import {visitExportDeclaration} from "./visitor/visit-export-declaration";
import {visitExportAssignment} from "./visitor/visit-export-assignment";
import {visitVariableStatement} from "./visitor/visit-variable-statement";
import {visitFunctionDeclaration} from "./visitor/visit-function-declaration";
import {visitTypeAliasDeclaration} from "./visitor/visit-type-alias-declaration";
import {visitClassDeclaration} from "./visitor/visit-class-declaration";
import {visitEnumDeclaration} from "./visitor/visit-enum-declaration";
import {visitInterfaceDeclaration} from "./visitor/visit-interface-declaration";
import {visitModuleDeclaration} from "./visitor/visit-module-declaration";
import {normalize} from "path";
import {visitExportSpecifier} from "./visitor/visit-export-specifier";
import {visitNamedExports} from "./visitor/visit-named-exports";

/**
 * // Tracks exports across files such that they can be added back in if necessary at a later point
 * @param {DeclarationPreBundlerOptions} options
 */
export function trackExports (options: DeclarationPreBundlerOptions): TransformerFactory<SourceFile> {

	return context => {
		return sourceFile => {
			const sourceFileName = normalize(sourceFile.fileName);

			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (!options.localModuleNames.includes(sourceFileName)) return updateSourceFileNode(sourceFile, [], true);

			if (options.pluginOptions.debug) {
				console.log(`=== BEFORE TRACKING EXPORTS === (${sourceFileName})`);
				console.log(options.printer.printFile(sourceFile));
			}

			let exportedSymbolSet = options.sourceFileToExportedSymbolSet.get(sourceFileName);

			if (exportedSymbolSet == null) {
				exportedSymbolSet = new Set();
				options.sourceFileToExportedSymbolSet.set(sourceFileName, exportedSymbolSet);
			}

			// Prepare some VisitorOptions
			const visitorOptions = {
				...options,
				sourceFile,
				isEntry: options.entryFileNames.includes(sourceFileName),
				childContinuation: <U extends Node> (node: U): U|undefined => {
					return visitEachChild(node, visitor, context);
				},
				continuation: <U extends Node> (node: U): U|undefined => {
					return visitor(node) as U|undefined;
				},
				markAsExported (exportedSymbol: ExportedSymbol): void {
					exportedSymbolSet!.add(exportedSymbol);
				}
			};

			/**
			 * Visits the given Node
			 * @param {Node} node
			 * @returns {Node | undefined}
			 */
			function visitor (node: Node): Node|Node[]|undefined {
				if (isExportAssignment(node)) return visitExportAssignment({node, ...visitorOptions});
				else if (isExportDeclaration(node)) return visitExportDeclaration({node, ...visitorOptions});
				else if (isNamedExports(node)) return visitNamedExports({node, ...visitorOptions});
				else if (isExportSpecifier(node)) return visitExportSpecifier({node, ...visitorOptions});
				else if (isVariableStatement(node)) return visitVariableStatement({node, ...visitorOptions});
				else if (isFunctionDeclaration(node)) return visitFunctionDeclaration({node, ...visitorOptions});
				else if (isTypeAliasDeclaration(node)) return visitTypeAliasDeclaration({node, ...visitorOptions});
				else if (isClassDeclaration(node)) return visitClassDeclaration({node, ...visitorOptions});
				else if (isEnumDeclaration(node)) return visitEnumDeclaration({node, ...visitorOptions});
				else if (isInterfaceDeclaration(node)) return visitInterfaceDeclaration({node, ...visitorOptions});
				else if (isModuleDeclaration(node)) return visitModuleDeclaration({node, ...visitorOptions});
				else return node;
			}

			let updatedSourceFile = visitEachChild(sourceFile, visitor, context);

			if (options.pluginOptions.debug) {
				console.log(`=== AFTER TRACKING EXPORTS === (${sourceFileName})`);
				console.log(options.printer.printFile(updatedSourceFile));
			}

			return updatedSourceFile;
		};
	};
}
