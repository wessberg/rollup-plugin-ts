import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {ObjectBindingPattern} from "typescript";

export function checkObjectBindingPattern({node, continuation}: ReferenceVisitorOptions<ObjectBindingPattern>): string[] {
	const referencedIdentifiers: string[] = [];

	for (const element of node.elements) {
		referencedIdentifiers.push(...continuation(element));
	}

	return referencedIdentifiers;
}
