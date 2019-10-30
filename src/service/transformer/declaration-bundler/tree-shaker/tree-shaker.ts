import {
	createExportDeclaration,
	createNamedExports,
	isImportClause,
	isImportDeclaration,
	isImportSpecifier,
	isNamedImports,
	isNamespaceImport,
	isVariableDeclaration,
	isVariableDeclarationList,
	isVariableStatement,
	Node,
	SourceFile,
	TransformerFactory,
	updateSourceFileNode,
	visitEachChild
} from "typescript";
import {DeclarationBundlerOptions} from "../declaration-bundler-options";
import {isReferenced} from "../reference/is-referenced/is-referenced";
import {mergeImports} from "../util/merge-imports/merge-imports";
import {mergeExports} from "../util/merge-exports/merge-exports";
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

export function treeShaker({declarationFilename, ...options}: DeclarationBundlerOptions): TransformerFactory<SourceFile> {
	return context => {
		return sourceFile => {
			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (normalize(sourceFile.fileName) !== normalize(declarationFilename)) return updateSourceFileNode(sourceFile, [], true);

			// Prepare some VisitorOptions
			const visitorOptions = {
				...options,
				sourceFile,
				isReferenced: <U extends Node>(node: U): boolean => {
					return isReferenced({...visitorOptions, node});
				},
				continuation: <U extends Node>(node: U): U | undefined => {
					return visitEachChild(node, visitor, context);
				}
			};

			function visitor(node: Node): Node | undefined {
				if (hasExportModifier(node)) return node;
				else if (isVariableStatement(node)) {
					return visitVariableStatement({node, ...visitorOptions});
				} else if (isVariableDeclarationList(node)) {
					return visitVariableDeclarationList({node, ...visitorOptions});
				} else if (isVariableDeclaration(node)) {
					return visitVariableDeclaration({node, ...visitorOptions});
				} else if (isImportDeclaration(node)) {
					return visitImportDeclaration({node, ...visitorOptions});
				} else if (isImportSpecifier(node)) {
					return visitImportSpecifier({node, ...visitorOptions});
				} else if (isImportClause(node)) {
					return visitImportClause({node, ...visitorOptions});
				} else if (isNamedImports(node)) {
					return visitNamedImports({node, ...visitorOptions});
				} else if (isNamespaceImport(node)) {
					return visitNamespaceImport({node, ...visitorOptions});
				} else if (isReferenced({...visitorOptions, node})) {
					return node;
				} else {
					return undefined;
				}
			}

			const updatedSourceFile = visitEachChild(sourceFile, visitor, context);
			const mergedStatements = mergeExports(mergeImports([...updatedSourceFile.statements]));

			return updateSourceFileNode(
				updatedSourceFile,
				mergedStatements.length < 1
					? // Create an 'export {}' declaration to mark the declaration file as module-based
					  [createExportDeclaration(undefined, undefined, createNamedExports([]))]
					: mergedStatements,
				updatedSourceFile.isDeclarationFile,
				updatedSourceFile.referencedFiles,
				updatedSourceFile.typeReferenceDirectives,
				updatedSourceFile.hasNoDefaultLib,
				updatedSourceFile.libReferenceDirectives
			);
		};
	};
}
