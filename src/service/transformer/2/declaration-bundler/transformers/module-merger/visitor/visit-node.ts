import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../../type/ts";
import {visitExportDeclaration} from "./visit-export-declaration";
import {visitImportTypeNode} from "./visit-import-type-node";

export function visitNode<T extends TS.Node>({node, ...options}: ModuleMergerVisitorOptions<T>): VisitResult<T> {
	if (options.typescript.isExportDeclaration(node)) {
		return (visitExportDeclaration({...options, node} as ModuleMergerVisitorOptions<TS.ExportDeclaration>) as unknown) as VisitResult<T>;
	} else if (options.typescript.isImportTypeNode(node)) {
		return (visitImportTypeNode({...options, node} as ModuleMergerVisitorOptions<TS.ImportTypeNode>) as unknown) as VisitResult<T>;
	} else {
		return (options.childContinuation(node, options.payload as never) as unknown) as VisitResult<T>;
	}
}
