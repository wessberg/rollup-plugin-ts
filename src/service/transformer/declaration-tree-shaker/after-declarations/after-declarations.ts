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
import {IDeclarationTreeShakerOptions} from "../i-declaration-tree-shaker-options";
import {isReferenced} from "../reference/is-referenced/is-referenced";
import {ReferenceCache} from "../reference/cache/reference-cache";
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
import {hasExportModifier} from "../../declaration-bundler/util/modifier/modifier-util";

export function afterDeclarations({declarationFilename}: IDeclarationTreeShakerOptions): TransformerFactory<SourceFile> {
	return context => {
		return sourceFile => {
			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (normalize(sourceFile.fileName) !== normalize(declarationFilename)) return updateSourceFileNode(sourceFile, [], true);

			// Prepare a cache
			const cache: ReferenceCache = {
				hasReferencesCache: new WeakMap(),
				identifierForNodeCache: new WeakMap()
			};

			// Prepare some VisitorOptions
			const visitorOptions = {
				sourceFile,
				cache,
				isReferenced: <U extends Node>(node: U): boolean => {
					return isReferenced({node, cache});
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
				} else if (isReferenced({node, cache})) {
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
