import {TS} from "../../../../../../type/ts";
import {StatementMergerVisitorOptions} from "../statement-merger-visitor-options";
import {visitImportDeclaration} from "./visit-import-declaration";
import {visitExportDeclaration} from "./visit-export-declaration";
import {visitExportAssignment} from "./visit-export-assignment";

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
