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
import {visitFunctionExpression} from "./visitor/visit-function-expression";
import {visitClassExpression} from "./visitor/visit-class-expression";
import {TS} from "../../../../type/ts";

/**
 * // Tracks exports across files such that they can be added back in if necessary at a later point
 */
export function trackExports({typescript, ...options}: DeclarationPreBundlerOptions): TS.TransformerFactory<TS.SourceFile> {
	return context => {
		return sourceFile => {
			const sourceFileName = normalize(sourceFile.fileName);

			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (!options.localModuleNames.includes(sourceFileName)) return typescript.updateSourceFileNode(sourceFile, [], true);

			if (options.pluginOptions.debug) {
				console.log(`=== BEFORE TRACKING EXPORTS === (${sourceFileName})`);
				console.log(options.printer.printFile(sourceFile));
			}

			let exportedSymbolSet = options.sourceFileToExportedSymbolSet.get(sourceFileName);

			if (exportedSymbolSet == null) {
				exportedSymbolSet = new Set();
				options.sourceFileToExportedSymbolSet.set(sourceFileName, exportedSymbolSet);
			}

			let currentModuleSpecifier: TS.Expression | undefined;

			// Prepare some VisitorOptions
			const visitorOptions = {
				...options,
				typescript,
				sourceFile,
				isEntry: options.entryFileNames.includes(sourceFileName),
				setCurrentModuleSpecifier(newModuleSpecifier: TS.Expression | undefined) {
					currentModuleSpecifier = newModuleSpecifier;
				},
				getCurrentModuleSpecifier(): TS.Expression | undefined {
					return currentModuleSpecifier;
				},
				childContinuation: <U extends TS.Node>(node: U): U | undefined => {
					return typescript.visitEachChild(node, visitor, context);
				},
				continuation: <U extends TS.Node>(node: U): U | undefined => {
					return visitor(node) as U | undefined;
				},
				markAsExported(exportedSymbol: ExportedSymbol): void {
					exportedSymbolSet!.add(exportedSymbol);
				}
			};

			/**
			 * Visits the given Node
			 */
			function visitor(node: TS.Node): TS.Node | TS.Node[] | undefined {
				if (typescript.isExportAssignment(node)) return visitExportAssignment({node, ...visitorOptions});
				else if (typescript.isExportDeclaration(node)) return visitExportDeclaration({node, ...visitorOptions});
				else if (typescript.isNamedExports(node)) return visitNamedExports({node, ...visitorOptions});
				else if (typescript.isExportSpecifier(node)) return visitExportSpecifier({node, ...visitorOptions});
				else if (typescript.isVariableStatement(node)) return visitVariableStatement({node, ...visitorOptions});
				else if (typescript.isFunctionDeclaration(node)) return visitFunctionDeclaration({node, ...visitorOptions});
				else if (typescript.isFunctionExpression(node)) return visitFunctionExpression({node, ...visitorOptions});
				else if (typescript.isTypeAliasDeclaration(node)) return visitTypeAliasDeclaration({node, ...visitorOptions});
				else if (typescript.isClassDeclaration(node)) return visitClassDeclaration({node, ...visitorOptions});
				else if (typescript.isClassExpression(node)) return visitClassExpression({node, ...visitorOptions});
				else if (typescript.isEnumDeclaration(node)) return visitEnumDeclaration({node, ...visitorOptions});
				else if (typescript.isInterfaceDeclaration(node)) return visitInterfaceDeclaration({node, ...visitorOptions});
				else if (typescript.isModuleDeclaration(node)) return visitModuleDeclaration({node, ...visitorOptions});
				else return node;
			}

			let updatedSourceFile = typescript.visitEachChild(sourceFile, visitor, context);

			if (options.pluginOptions.debug) {
				console.log(`=== AFTER TRACKING EXPORTS === (${sourceFileName})`);
				console.log(options.printer.printFile(updatedSourceFile));
			}

			return updatedSourceFile;
		};
	};
}
