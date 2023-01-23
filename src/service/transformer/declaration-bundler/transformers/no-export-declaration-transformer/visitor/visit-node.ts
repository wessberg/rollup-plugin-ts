import type {TS} from "../../../../../../type/ts.js";
import type {NoExportDeclarationTransformerVisitorOptions} from "../no-export-declaration-transformer-visitor-options.js";
import {visitExportDeclaration} from "./visit-export-declaration.js";
import {visitExportAssignment} from "./visit-export-assignment.js";

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
