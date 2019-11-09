import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {isIdentifier, PropertyDeclaration} from "typescript";

export function checkPropertyDeclaration({node, continuation}: ReferenceVisitorOptions<PropertyDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];

	if (!isIdentifier(node.name)) {
		referencedIdentifiers.push(...continuation(node.name));
	}

	if (node.type != null) {
		referencedIdentifiers.push(...continuation(node.type));
	}

	if (node.initializer != null) {
		referencedIdentifiers.push(...continuation(node.initializer));
	}

	return referencedIdentifiers;
}
