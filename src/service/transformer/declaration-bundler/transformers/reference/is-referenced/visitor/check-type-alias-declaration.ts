import type {ReferenceVisitorOptions} from "../reference-visitor-options.js";
import type {TS} from "../../../../../../../type/ts.js";

export function checkTypeAliasDeclaration({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<TS.TypeAliasDeclaration>): string[] {
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
