import type {ReferenceVisitorOptions} from "../reference-visitor-options.js";
import type {TS} from "../../../../../../../type/ts.js";

export function checkEnumDeclaration({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<TS.EnumDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];

	for (const member of node.members) {
		referencedIdentifiers.push(...continuation(member));
	}

	markIdentifiersAsReferenced(node, ...referencedIdentifiers);
	return referencedIdentifiers;
}
