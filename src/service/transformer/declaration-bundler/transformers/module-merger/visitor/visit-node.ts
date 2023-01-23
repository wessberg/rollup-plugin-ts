import type {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options.js";
import type {TS} from "../../../../../../type/ts.js";
import {visitExportDeclaration} from "./visit-export-declaration.js";
import {visitImportTypeNode} from "./visit-import-type-node.js";
import {visitImportDeclaration} from "./visit-import-declaration.js";
import {visitImportSpecifier} from "./visit-import-specifier.js";
import {visitExportSpecifier} from "./visit-export-specifier.js";
import {visitImportClause} from "./visit-import-clause.js";
import {visitNamespaceImport} from "./visit-namespace-import.js";
import {visitSourceFile} from "./visit-source-file.js";

export function visitNode<T extends TS.Node>({node, ...options}: ModuleMergerVisitorOptions<T>): VisitResult<T> {
	if (options.typescript.isSourceFile(node)) {
		return visitSourceFile({...options, node} as ModuleMergerVisitorOptions<TS.SourceFile>) as unknown as VisitResult<T>;
	} else if (options.typescript.isExportDeclaration(node)) {
		return visitExportDeclaration({...options, node} as ModuleMergerVisitorOptions<TS.ExportDeclaration>) as unknown as VisitResult<T>;
	} else if (options.typescript.isImportDeclaration(node)) {
		return visitImportDeclaration({...options, node} as ModuleMergerVisitorOptions<TS.ImportDeclaration>) as unknown as VisitResult<T>;
	} else if (options.typescript.isImportTypeNode(node)) {
		return visitImportTypeNode({...options, node} as ModuleMergerVisitorOptions<TS.ImportTypeNode>) as unknown as VisitResult<T>;
	} else if (options.typescript.isImportClause(node)) {
		return visitImportClause({...options, node} as ModuleMergerVisitorOptions<TS.ImportClause>) as unknown as VisitResult<T>;
	} else if (options.typescript.isNamespaceImport(node)) {
		return visitNamespaceImport({...options, node} as ModuleMergerVisitorOptions<TS.NamespaceImport>) as unknown as VisitResult<T>;
	} else if (options.typescript.isImportSpecifier(node)) {
		return visitImportSpecifier({...options, node} as ModuleMergerVisitorOptions<TS.ImportSpecifier>) as unknown as VisitResult<T>;
	} else if (options.typescript.isExportSpecifier(node)) {
		return visitExportSpecifier({...options, node} as ModuleMergerVisitorOptions<TS.ExportSpecifier>) as unknown as VisitResult<T>;
	} else {
		return options.childContinuation(node, options.payload as never) as unknown as VisitResult<T>;
	}
}
