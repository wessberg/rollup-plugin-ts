import type {TS} from "../../../../../../type/ts.js";
import type {StatementMergerVisitorOptions} from "../statement-merger-visitor-options.js";
import {visitImportDeclaration} from "./visit-import-declaration.js";
import {visitExportDeclaration} from "./visit-export-declaration.js";
import {visitExportAssignment} from "./visit-export-assignment.js";

export function visitNode({node, ...options}: StatementMergerVisitorOptions<TS.Node>): TS.Node | TS.Node[] | undefined {
	if (options.typescript.isImportDeclaration(node)) {
		return visitImportDeclaration({...options, node});
	} else if (options.typescript.isExportDeclaration(node)) {
		return visitExportDeclaration({...options, node});
	} else if (options.typescript.isExportAssignment(node)) {
		return visitExportAssignment({...options, node});
	} else {
		// Only consider root-level statements here
		return node;
	}
}
