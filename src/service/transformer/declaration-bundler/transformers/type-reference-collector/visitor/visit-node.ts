import {TS} from "../../../../../../type/ts";
import {TypeReferenceCollectorVisitorOptions} from "../type-reference-collector-visitor-options";
import {visitIdentifier} from "./visit-identifier";

export function visitNode({node, ...options}: TypeReferenceCollectorVisitorOptions<TS.Node>): void {
	if (options.typescript.isIdentifier(node)) {
		return visitIdentifier({...options, node});
	} else {
		// Only consider root-level statements here
		return options.childContinuation(node);
	}
}
