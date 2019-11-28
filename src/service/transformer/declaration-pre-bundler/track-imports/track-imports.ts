import {DeclarationPreBundlerOptions, ImportedSymbol} from "../declaration-pre-bundler-options";
import {normalize} from "path";
import {visitImportTypeNode} from "./visitor/visit-import-type-node";
import {visitImportClause} from "./visitor/visit-import-clause";
import {visitNamespaceImport} from "./visitor/visit-namespace-import";
import {visitImportSpecifier} from "./visitor/visit-import-specifier";
import {visitImportDeclaration} from "./visitor/visit-import-declaration";
import {TS} from "../../../../type/ts";

/**
 * Tracks imports across files such that they can be added back in if necessary at a later point or at
 * least to understand the dependencies across modules
 */
export function trackImports({typescript, ...options}: DeclarationPreBundlerOptions): TS.TransformerFactory<TS.SourceFile> {
	return context => {
		return sourceFile => {
			const sourceFileName = normalize(sourceFile.fileName);

			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (!options.localModuleNames.includes(sourceFileName)) return typescript.updateSourceFileNode(sourceFile, [], true);

			if (options.pluginOptions.debug) {
				console.log(`=== BEFORE TRACKING IMPORTS === (${sourceFileName})`);
				console.log(options.printer.printFile(sourceFile));
			}

			let importedSymbolSet = options.sourceFileToImportedSymbolSet.get(sourceFileName);

			if (importedSymbolSet == null) {
				importedSymbolSet = new Set();
				options.sourceFileToImportedSymbolSet.set(sourceFileName, importedSymbolSet);
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
				markAsImported(importedSymbol: ImportedSymbol): void {
					importedSymbolSet!.add(importedSymbol);
				}
			};

			/**
			 * Visits the given Node
			 */
			function visitor(node: TS.Node): TS.Node | TS.Node[] | undefined {
				// Some TypeScript versions may not support ImportTypeNodes, hence the optional call
				if (typescript.isImportTypeNode?.(node)) return visitImportTypeNode({node, ...visitorOptions});
				else if (typescript.isImportDeclaration(node)) return visitImportDeclaration({node, ...visitorOptions});
				else if (typescript.isImportClause(node)) return visitImportClause({node, ...visitorOptions});
				else if (typescript.isImportSpecifier(node)) return visitImportSpecifier({node, ...visitorOptions});
				else if (typescript.isNamespaceImport(node)) return visitNamespaceImport({node, ...visitorOptions});
				else return typescript.visitEachChild(node, visitor, context);
			}

			let updatedSourceFile = typescript.visitEachChild(sourceFile, visitor, context);

			if (options.pluginOptions.debug) {
				console.log(`=== AFTER TRACKING IMPORTS === (${sourceFileName})`);
				console.log(options.printer.printFile(updatedSourceFile));
			}

			return updatedSourceFile;
		};
	};
}
