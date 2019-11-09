import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {ArrayBindingPattern} from "typescript";

export function checkArrayBindingPattern({node, continuation}: ReferenceVisitorOptions<ArrayBindingPattern>): string[] {
	const referencedIdentifiers: string[] = [];

	for (const element of node.elements) {
		referencedIdentifiers.push(...continuation(element));
	}

	return referencedIdentifiers;
}
