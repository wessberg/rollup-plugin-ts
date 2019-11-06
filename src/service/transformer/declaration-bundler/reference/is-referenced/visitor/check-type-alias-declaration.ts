import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TypeAliasDeclaration} from "typescript";

export function checkTypeAliasDeclaration({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<TypeAliasDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];

	if (node.typeParameters != null) {
		for (const typeParameter of node.typeParameters) {
			referencedIdentifiers.push(...continuation(typeParameter));
		}
	}

	referencedIdentifiers.push(...continuation(node.type));

	markIdentifiersAsReferenced(node, ...referencedIdentifiers);
	return referencedIdentifiers;
}
