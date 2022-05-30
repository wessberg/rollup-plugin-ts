import {TS} from "../../../../../../type/ts.js";
import {TrackImportsTransformerVisitorOptions} from "../track-imports-transformer-visitor-options.js";
import {visitImportDeclaration} from "./visit-import-declaration.js";
import {visitImportTypeNode} from "./visit-import-type-node.js";
import {visitModuleDeclaration} from "./visit-module-declaration.js";

export function visitNode({node, ...options}: TrackImportsTransformerVisitorOptions<TS.Node>): void {
	if (options.typescript.isImportDeclaration(node)) {
		return visitImportDeclaration({...options, node});
	} else if (options.typescript.isImportTypeNode(node)) {
		return visitImportTypeNode({...options, node});
	} else if (options.typescript.isModuleDeclaration(node)) {
		return visitModuleDeclaration({...options, node});
	} else if (options.shouldDeepTraverse) {
		return options.childContinuation(node);
	}
}
