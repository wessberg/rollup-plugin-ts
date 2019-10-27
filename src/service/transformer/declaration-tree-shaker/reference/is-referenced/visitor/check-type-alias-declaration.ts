import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TypeAliasDeclaration} from "typescript";

export function checkTypeAliasDeclaration({node, childContinuation}: ReferenceVisitorOptions<TypeAliasDeclaration>): boolean {
	if (node.typeParameters != null) {
		for (const typeParameter of node.typeParameters) {
			if (childContinuation(typeParameter)) return true;
		}
	}

	return false;
}
