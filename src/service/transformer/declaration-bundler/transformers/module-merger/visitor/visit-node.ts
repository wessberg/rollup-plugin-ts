import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../type/ts";
import {visitExportDeclaration} from "./visit-export-declaration";
import {visitImportTypeNode} from "./visit-import-type-node";
import {visitImportDeclaration} from "./visit-import-declaration";
import {visitImportSpecifier} from "./visit-import-specifier";
import {visitExportSpecifier} from "./visit-export-specifier";
import {visitImportClause} from "./visit-import-clause";
import {visitNamespaceImport} from "./visit-namespace-import";
import {visitSourceFile} from "./visit-source-file";

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
