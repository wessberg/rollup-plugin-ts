import {
	Expression,
	isImportClause,
	isImportDeclaration,
	isImportSpecifier,
	isImportTypeNode,
	isNamespaceImport,
	Node,
	SourceFile,
	TransformerFactory,
	updateSourceFileNode,
	visitEachChild
} from "typescript";
import {DeclarationPreBundlerOptions, ImportedSymbol} from "../declaration-pre-bundler-options";
import {normalize} from "path";
import {visitImportTypeNode} from "./visitor/visit-import-type-node";
import {visitImportClause} from "./visitor/visit-import-clause";
import {visitNamespaceImport} from "./visitor/visit-namespace-import";
import {visitImportSpecifier} from "./visitor/visit-import-specifier";
import {visitImportDeclaration} from "./visitor/visit-import-declaration";

/**
 * Tracks imports across files such that they can be added back in if necessary at a later point or at
 * least to understand the dependencies across modules
 * @param {DeclarationPreBundlerOptions} options
 */
export function trackImports(options: DeclarationPreBundlerOptions): TransformerFactory<SourceFile> {
	return context => {
		return sourceFile => {
			const sourceFileName = normalize(sourceFile.fileName);

			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (!options.localModuleNames.includes(sourceFileName)) return updateSourceFileNode(sourceFile, [], true);

			if (options.pluginOptions.debug) {
				console.log(`=== BEFORE TRACKING IMPORTS === (${sourceFileName})`);
				console.log(options.printer.printFile(sourceFile));
			}

			let importedSymbolSet = options.sourceFileToImportedSymbolSet.get(sourceFileName);

			if (importedSymbolSet == null) {
				importedSymbolSet = new Set();
				options.sourceFileToImportedSymbolSet.set(sourceFileName, importedSymbolSet);
			}

			let currentModuleSpecifier: Expression | undefined;

			// Prepare some VisitorOptions
			const visitorOptions = {
				...options,
				sourceFile,
				isEntry: options.entryFileNames.includes(sourceFileName),
				setCurrentModuleSpecifier(newModuleSpecifier: Expression | undefined) {
					currentModuleSpecifier = newModuleSpecifier;
				},
				getCurrentModuleSpecifier(): Expression | undefined {
					return currentModuleSpecifier;
				},
				childContinuation: <U extends Node>(node: U): U | undefined => {
					return visitEachChild(node, visitor, context);
				},
				continuation: <U extends Node>(node: U): U | undefined => {
					return visitor(node) as U | undefined;
				},
				markAsImported(importedSymbol: ImportedSymbol): void {
					importedSymbolSet!.add(importedSymbol);
				}
			};

			/**
			 * Visits the given Node
			 * @param {Node} node
			 * @returns {Node | undefined}
			 */
			function visitor(node: Node): Node | Node[] | undefined {
				if (isImportTypeNode(node)) return visitImportTypeNode({node, ...visitorOptions});
				else if (isImportDeclaration(node)) return visitImportDeclaration({node, ...visitorOptions});
				else if (isImportClause(node)) return visitImportClause({node, ...visitorOptions});
				else if (isImportSpecifier(node)) return visitImportSpecifier({node, ...visitorOptions});
				else if (isNamespaceImport(node)) return visitNamespaceImport({node, ...visitorOptions});
				else return visitEachChild(node, visitor, context);
			}

			let updatedSourceFile = visitEachChild(sourceFile, visitor, context);

			if (options.pluginOptions.debug) {
				console.log(`=== AFTER TRACKING IMPORTS === (${sourceFileName})`);
				console.log(options.printer.printFile(updatedSourceFile));
			}

			return updatedSourceFile;
		};
	};
}
