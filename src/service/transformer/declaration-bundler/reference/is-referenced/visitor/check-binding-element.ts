import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {BindingElement, isIdentifier} from "typescript";

export function checkBindingElement({node, continuation}: ReferenceVisitorOptions<BindingElement>): string[] {
	const referencedIdentifiers: string[] = [];

	if (!isIdentifier(node.name)) {
		referencedIdentifiers.push(...continuation(node.name));
	}

	if (node.initializer != null) {
		referencedIdentifiers.push(...continuation(node.initializer));
	}

	if (node.propertyName != null && !isIdentifier(node.propertyName)) {
		referencedIdentifiers.push(...continuation(node.propertyName));
	}
	return referencedIdentifiers;
}
