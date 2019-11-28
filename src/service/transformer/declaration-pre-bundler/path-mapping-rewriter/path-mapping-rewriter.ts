import {visitImportDeclaration} from "./visitor/visit-import-declaration";
import {visitExportDeclaration} from "./visitor/visit-export-declaration";
import {DeclarationPreBundlerOptions} from "../declaration-pre-bundler-options";
import {visitImportTypeNode} from "./visitor/visit-import-type-node";
import {normalize} from "path";
import {TS} from "../../../../type/ts";

/**
 * Resolves path mapped aliases and update module specifiers such that they point to the actual files
 */
export function pathMappingRewriter({typescript, ...options}: DeclarationPreBundlerOptions): TS.TransformerFactory<TS.SourceFile> {
	return context => {
		return sourceFile => {
			const sourceFileName = normalize(sourceFile.fileName);

			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (!options.localModuleNames.includes(sourceFileName)) return typescript.updateSourceFileNode(sourceFile, [], true);

			if (options.pluginOptions.debug) {
				console.log(`=== BEFORE PATH REWRITING === (${sourceFileName})`);
				console.log(options.printer.printFile(sourceFile));
			}

			// Prepare some VisitorOptions
			const visitorOptions = {
				sourceFile,
				typescript,
				...options,
				continuation: <U extends TS.Node>(node: U) => {
					return typescript.visitEachChild(node, visitor, context);
				}
			};

			/**
			 * Visits the given Node
			 */
			function visitor(node: TS.Node): TS.Node | undefined {
				if (typescript.isImportDeclaration(node)) {
					return visitImportDeclaration({...visitorOptions, node});
				} else if (typescript.isExportDeclaration(node)) {
					return visitExportDeclaration({...visitorOptions, node});
					// ImportTypeNodes may not be supported by the current version of Typescript, hence the optional call
				} else if (typescript.isImportTypeNode?.(node)) {
					return visitImportTypeNode({...visitorOptions, node});
				}

				return typescript.visitEachChild(node, visitor, context);
			}

			const result = typescript.visitEachChild(sourceFile, visitor, context);

			if (options.pluginOptions.debug) {
				console.log(`=== AFTER PATH REWRITING === (${normalize(sourceFile.fileName)})`);
				console.log(options.printer.printFile(result));
			}

			return result;
		};
	};
}
