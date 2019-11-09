import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {isIdentifier, MethodDeclaration} from "typescript";

export function checkMethodDeclaration({node, continuation}: ReferenceVisitorOptions<MethodDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];

	if (!isIdentifier(node.name)) {
		referencedIdentifiers.push(...continuation(node.name));
	}
	for (const parameter of node.parameters) {
		referencedIdentifiers.push(...continuation(parameter));
	}

	if (node.typeParameters != null) {
		for (const typeParameter of node.typeParameters) {
			referencedIdentifiers.push(...continuation(typeParameter));
		}
	}

	if (node.type != null) {
		referencedIdentifiers.push(...continuation(node.type));
	}

	if (node.body != null) {
		referencedIdentifiers.push(...continuation(node.body));
	}

	return referencedIdentifiers;
}
