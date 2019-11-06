import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {isIdentifier, ParameterDeclaration} from "typescript";

export function checkParameterDeclaration ({node, continuation}: ReferenceVisitorOptions<ParameterDeclaration>): string[] {
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
