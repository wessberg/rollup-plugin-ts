import {isClassDeclaration, isClassExpression, isEnumDeclaration, isExportDeclaration, isFunctionDeclaration, isFunctionExpression, isImportClause, isImportDeclaration, isImportSpecifier, isInterfaceDeclaration, isModuleDeclaration, isNamedImports, isNamespaceImport, isTypeAliasDeclaration, isVariableDeclaration, isVariableDeclarationList, isVariableStatement, Node, SourceFile, TransformerFactory, updateSourceFileNode, visitEachChild} from "typescript";
import {DeclarationBundlerOptions} from "../declaration-bundler-options";
import {isReferenced} from "../reference/is-referenced/is-referenced";
import {normalize} from "path";
import {visitImportDeclaration} from "./visitor/visit-import-declaration";
import {visitVariableStatement} from "./visitor/visit-variable-statement";
import {visitVariableDeclarationList} from "./visitor/visit-variable-declaration-list";
import {visitVariableDeclaration} from "./visitor/visit-variable-declaration";
import {visitImportSpecifier} from "./visitor/visit-import-specifier";
import {visitImportClause} from "./visitor/visit-import-clause";
import {visitNamedImports} from "./visitor/visit-named-imports";
import {visitNamespaceImport} from "./visitor/visit-namespace-import";
import {hasExportModifier} from "../../declaration-pre-bundler/util/modifier/modifier-util";
import {visitClassDeclaration} from "./visitor/visit-class-declaration";
import {visitClassExpression} from "./visitor/visit-class-expression";
import {visitFunctionDeclaration} from "./visitor/visit-function-declaration";
import {visitFunctionExpression} from "./visitor/visit-function-expression";
import {visitEnumDeclaration} from "./visitor/visit-enum-declaration";
import {visitInterfaceDeclaration} from "./visitor/visit-interface-declaration";
import {visitTypeAliasDeclaration} from "./visitor/visit-type-alias-declaration";
import {visitModuleDeclaration} from "./visitor/visit-module-declaration";
import {visitExportDeclaration} from "./visitor/visit-export-declaration";

export function treeShaker ({declarationFilename, ...options}: DeclarationBundlerOptions): TransformerFactory<SourceFile> {
	return context => {
		return sourceFile => {
			const sourceFileName = normalize(sourceFile.fileName);

			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (sourceFileName !== normalize(declarationFilename)) return updateSourceFileNode(sourceFile, [], true);

			if (options.pluginOptions.debug) {
				console.log(`=== BEFORE TREE-SHAKING === (${sourceFileName})`);
				console.log(options.printer.printFile(sourceFile));
			}

			// Prepare some VisitorOptions
			const visitorOptions = {
				...options,
				sourceFile,
				isReferenced: <U extends Node> (node: U): boolean => {
					return isReferenced({...visitorOptions, node});
				},
				continuation: <U extends Node> (node: U): U|undefined => {
					return visitor(node) as U | undefined;
				}
			};

			function visitor (node: Node): Node|undefined {
				if (hasExportModifier(node)) return node;

				if (isClassDeclaration(node)) {
					return visitClassDeclaration({...visitorOptions, node});
				}

				else if (isClassExpression(node)) {
					return visitClassExpression({...visitorOptions, node});
				}

				else if (isFunctionDeclaration(node)) {
					return visitFunctionDeclaration({...visitorOptions, node});
				}

				else if (isFunctionExpression(node)) {
					return visitFunctionExpression({...visitorOptions, node});
				}

				else if (isEnumDeclaration(node)) {
					return visitEnumDeclaration({...visitorOptions, node});
				}

				else if (isInterfaceDeclaration(node)) {
					return visitInterfaceDeclaration({...visitorOptions, node});
				}

				else if (isTypeAliasDeclaration(node)) {
					return visitTypeAliasDeclaration({...visitorOptions, node});
				}

				else if (isModuleDeclaration(node)) {
					return visitModuleDeclaration({...visitorOptions, node});
				}

				else if (isExportDeclaration(node)) {
					return visitExportDeclaration({...visitorOptions, node});
				}

				else if (isVariableStatement(node)) {
					return visitVariableStatement({node, ...visitorOptions});
				}

				else if (isVariableDeclarationList(node)) {
					return visitVariableDeclarationList({node, ...visitorOptions});
				}

				else if (isVariableDeclaration(node)) {
					return visitVariableDeclaration({node, ...visitorOptions});
				}

				else if (isImportDeclaration(node)) {
					return visitImportDeclaration({node, ...visitorOptions});
				}

				else if (isImportSpecifier(node)) {
					return visitImportSpecifier({node, ...visitorOptions});
				}

				else if (isImportClause(node)) {
					return visitImportClause({node, ...visitorOptions});
				}

				else if (isNamedImports(node)) {
					return visitNamedImports({node, ...visitorOptions});
				}

				else if (isNamespaceImport(node)) {
					return visitNamespaceImport({node, ...visitorOptions});
				}

				else {
					// Fall back to dropping the node
					return undefined;
				}
			}

			const updatedSourceFile = visitEachChild(sourceFile, visitor, context);

			if (options.pluginOptions.debug) {
				console.log(`=== AFTER TREE-SHAKING === (${sourceFileName})`);
				console.log(options.printer.printFile(updatedSourceFile));
			}

			return updatedSourceFile;
		};
	};
}
