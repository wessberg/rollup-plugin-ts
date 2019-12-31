import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TS} from "../../../../../../../type/ts";

export function checkEnumDeclaration({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<TS.EnumDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];

	for (const member of node.members) {
		referencedIdentifiers.push(...continuation(member));
	}

	markIdentifiersAsReferenced(node, ...referencedIdentifiers);
	return referencedIdentifiers;
}
