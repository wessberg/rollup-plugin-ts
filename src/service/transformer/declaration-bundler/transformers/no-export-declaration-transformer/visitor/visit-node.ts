import {TS} from "../../../../../../type/ts";
import {NoExportDeclarationTransformerVisitorOptions} from "../no-export-declaration-transformer-visitor-options";
import {visitExportDeclaration} from "./visit-export-declaration";
import {visitExportAssignment} from "./visit-export-assignment";

export function visitNode({node, ...options}: NoExportDeclarationTransformerVisitorOptions<TS.Node>): TS.Node | undefined {
	if (options.typescript.isExportDeclaration(node)) {
		return visitExportDeclaration({...options, node});
	} else if (options.typescript.isExportAssignment(node)) {
		return visitExportAssignment({...options, node});
	} else {
		// Preserve the node
		return node;
	}
}
