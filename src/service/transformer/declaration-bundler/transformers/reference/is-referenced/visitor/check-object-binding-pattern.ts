import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TS} from "../../../../../../../type/ts";

export function checkObjectBindingPattern({node, continuation}: ReferenceVisitorOptions<TS.ObjectBindingPattern>): string[] {
	const referencedIdentifiers: string[] = [];

	for (const element of node.elements) {
		referencedIdentifiers.push(...continuation(element));
	}

	return referencedIdentifiers;
}
