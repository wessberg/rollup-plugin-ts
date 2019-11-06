import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {EnumDeclaration} from "typescript";

export function checkEnumDeclaration({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<EnumDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];

	for (const member of node.members) {
		referencedIdentifiers.push(...continuation(member));
	}

	markIdentifiersAsReferenced(node, ...referencedIdentifiers);
	return referencedIdentifiers;
}
