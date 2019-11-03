import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {ClassDeclaration} from "typescript";

export function checkClassDeclaration({node, continuation}: ReferenceVisitorOptions<ClassDeclaration>): boolean {
	if (node.heritageClauses != null) {
		for (const heritageClause of node.heritageClauses) {
			if (continuation(heritageClause)) return true;
		}
	}

	if (node.typeParameters != null) {
		for (const typeParameter of node.typeParameters) {
			if (continuation(typeParameter)) return true;
		}
	}

	for (const member of node.members) {
		if (continuation(member)) return true;
	}

	return false;
}
