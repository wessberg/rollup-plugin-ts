import {
	isExportDeclaration,
	isImportDeclaration,
	isImportTypeNode,
	Node,
	SourceFile,
	TransformerFactory,
	updateSourceFileNode,
	visitEachChild
} from "typescript";
import {visitImportDeclaration} from "./visitor/visit-import-declaration";
import {visitExportDeclaration} from "./visitor/visit-export-declaration";
import {DeclarationPreBundlerOptions} from "../declaration-pre-bundler-options";
import {visitImportTypeNode} from "./visitor/visit-import-type-node";
import {normalize} from "path";

/**
 * Resolves path mapped aliases and update module specifiers such that they point to the actual files
 * @param {DeclarationPreBundlerOptions} options
 */
export function pathMappingRewriter(options: DeclarationPreBundlerOptions): TransformerFactory<SourceFile> {
	return context => {
		return sourceFile => {
			const sourceFileName = normalize(sourceFile.fileName);

			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (!options.localModuleNames.includes(sourceFileName)) return updateSourceFileNode(sourceFile, [], true);

			if (options.pluginOptions.debug) {
				console.log(`=== BEFORE PATH REWRITING === (${sourceFileName})`);
				console.log(options.printer.printFile(sourceFile));
			}

			// Prepare some VisitorOptions
			const visitorOptions = {
				sourceFile,
				...options,
				continuation: <U extends Node>(node: U) => {
					return visitEachChild(node, visitor, context);
				}
			};

			/**
			 * Visits the given Node
			 * @param {Node} node
			 * @returns {Node | undefined}
			 */
			function visitor(node: Node): Node | undefined {
				if (isImportDeclaration(node)) {
					return visitImportDeclaration({...visitorOptions, node});
				} else if (isExportDeclaration(node)) {
					return visitExportDeclaration({...visitorOptions, node});
				} else if (isImportTypeNode(node)) {
					return visitImportTypeNode({...visitorOptions, node});
				}

				return visitEachChild(node, visitor, context);
			}

			const result = visitEachChild(sourceFile, visitor, context);

			if (options.pluginOptions.debug) {
				console.log(`=== AFTER PATH REWRITING === (${normalize(sourceFile.fileName)})`);
				console.log(options.printer.printFile(result));
			}

			return result;
		};
	};
}
