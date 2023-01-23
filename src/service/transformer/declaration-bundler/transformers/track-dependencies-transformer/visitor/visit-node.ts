import type {TS} from "../../../../../../type/ts.js";
import type {TrackDependenciesTransformerVisitorOptions} from "../track-dependencies-transformer-visitor-options.js";
import {visitImportDeclaration} from "./visit-import-declaration.js";
import {visitImportTypeNode} from "./visit-import-type-node.js";
import {visitModuleDeclaration} from "./visit-module-declaration.js";
import {visitExportDeclaration} from "./visit-export-declaration.js";

export function visitNode({node, ...options}: TrackDependenciesTransformerVisitorOptions<TS.Node>): void {
	if (options.typescript.isImportDeclaration(node)) {
		return visitImportDeclaration({...options, node});
	} else if (options.typescript.isImportTypeNode(node)) {
		return visitImportTypeNode({...options, node});
	} else if (options.typescript.isExportDeclaration(node)) {
		return visitExportDeclaration({...options, node});
	} else if (options.typescript.isModuleDeclaration(node)) {
		return visitModuleDeclaration({...options, node});
	} else if (options.shouldDeepTraverse) {
		return options.childContinuation(node);
	}
}
