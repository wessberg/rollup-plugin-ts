import {TS} from "../../../../../../type/ts";
import {TrackImportsTransformerVisitorOptions} from "../track-imports-transformer-visitor-options";
import {visitImportDeclaration} from "./visit-import-declaration";
import {visitImportTypeNode} from "./visit-import-type-node";

export function visitNode({node, ...options}: TrackImportsTransformerVisitorOptions<TS.Node>): void {
	if (options.typescript.isImportDeclaration(node)) {
		return visitImportDeclaration({...options, node});
	} else if (options.typescript.isImportTypeNode(node)) {
		return visitImportTypeNode({...options, node});
	} else {
		return options.childContinuation(node);
	}
}
