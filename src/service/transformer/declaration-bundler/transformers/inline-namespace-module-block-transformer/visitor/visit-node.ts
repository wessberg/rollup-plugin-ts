import {TS} from "../../../../../../type/ts";
import {InlineNamespaceModuleBlockVisitorOptions} from "../inline-namespace-module-block-visitor-options";
import {visitImportDeclaration} from "./visit-import-declaration";
import {visitExportDeclaration} from "./visit-export-declaration";
import {visitModuleDeclaration} from "./visit-module-declaration";

export function visitNode({node, ...options}: InlineNamespaceModuleBlockVisitorOptions<TS.Node>): TS.Node | undefined {
	if (options.typescript.isImportDeclaration(node)) {
		return visitImportDeclaration({...options, node});
	} else if (options.typescript.isExportDeclaration(node)) {
		return visitExportDeclaration({...options, node});
	} else if (options.typescript.isModuleDeclaration(node)) {
		return visitModuleDeclaration({...options, node});
	} else {
		// Only consider root-level statements here
		return node;
	}
}
