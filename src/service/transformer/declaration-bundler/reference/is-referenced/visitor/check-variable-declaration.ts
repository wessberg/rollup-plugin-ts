import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {VariableDeclaration} from "typescript";

export function checkVariableDeclaration({node, continuation}: ReferenceVisitorOptions<VariableDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];
	if (node.initializer != null) {
		referencedIdentifiers.push(...continuation(node.initializer));
	}

	if (node.type != null) {
		referencedIdentifiers.push(...continuation(node.type));
	}

	return referencedIdentifiers;
}
