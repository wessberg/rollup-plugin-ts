import {TS} from "../../../../../../type/ts";
import {TrackDependenciesTransformerVisitorOptions} from "../track-dependencies-transformer-visitor-options";
import {visitImportDeclaration} from "./visit-import-declaration";
import {visitImportTypeNode} from "./visit-import-type-node";
import {visitModuleDeclaration} from "./visit-module-declaration";
import {visitExportDeclaration} from "./visit-export-declaration";

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
