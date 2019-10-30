import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {ClassDeclaration} from "typescript";

export function checkClassDeclaration({node, childContinuation}: ReferenceVisitorOptions<ClassDeclaration>): boolean {
	if (node.heritageClauses != null) {
		for (const heritageClause of node.heritageClauses) {
			if (childContinuation(heritageClause)) return true;
		}
	}

	if (node.typeParameters != null) {
		for (const typeParameter of node.typeParameters) {
			if (childContinuation(typeParameter)) return true;
		}
	}

	for (const member of node.members) {
		if (childContinuation(member)) return true;
	}

	return false;
}
