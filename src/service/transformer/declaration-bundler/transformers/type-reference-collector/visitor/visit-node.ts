import type {TS} from "../../../../../../type/ts.js";
import type {TypeReferenceCollectorVisitorOptions} from "../type-reference-collector-visitor-options.js";
import {visitIdentifier} from "./visit-identifier.js";

export function visitNode({node, ...options}: TypeReferenceCollectorVisitorOptions<TS.Node>): void {
	if (options.typescript.isIdentifier(node)) {
		return visitIdentifier({...options, node});
	} else {
		// Only consider root-level statements here
		return options.childContinuation(node);
	}
}
