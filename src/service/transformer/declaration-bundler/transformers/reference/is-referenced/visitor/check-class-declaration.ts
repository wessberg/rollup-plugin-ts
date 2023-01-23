import type {ReferenceVisitorOptions} from "../reference-visitor-options.js";
import type {TS} from "../../../../../../../type/ts.js";

export function checkClassDeclaration({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<TS.ClassDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];
	if (node.heritageClauses != null) {
		for (const heritageClause of node.heritageClauses) {
			referencedIdentifiers.push(...continuation(heritageClause));
		}
	}

	if (node.typeParameters != null) {
		for (const typeParameter of node.typeParameters) {
			referencedIdentifiers.push(...continuation(typeParameter));
		}
	}

	for (const member of node.members) {
		referencedIdentifiers.push(...continuation(member));
	}

	markIdentifiersAsReferenced(node, ...referencedIdentifiers);
	return referencedIdentifiers;
}
