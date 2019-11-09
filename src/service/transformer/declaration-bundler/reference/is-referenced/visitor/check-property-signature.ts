import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {isIdentifier, PropertySignature} from "typescript";

export function checkPropertySignature({node, continuation}: ReferenceVisitorOptions<PropertySignature>): string[] {
	const referencedIdentifiers: string[] = [];

	if (!isIdentifier(node.name)) {
		referencedIdentifiers.push(...continuation(node.name));
	}

	if (node.initializer != null) {
		referencedIdentifiers.push(...continuation(node.initializer));
	}

	if (node.type != null) {
		referencedIdentifiers.push(...continuation(node.type));
	}
	return referencedIdentifiers;
}
