import type {TS} from "../../../../../../type/ts.js";
import type {InlineNamespaceModuleBlockVisitorOptions} from "../inline-namespace-module-block-visitor-options.js";
import {visitImportDeclaration} from "./visit-import-declaration.js";
import {visitExportDeclaration} from "./visit-export-declaration.js";
import {visitModuleDeclaration} from "./visit-module-declaration.js";

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
