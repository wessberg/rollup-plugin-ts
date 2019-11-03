import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TypeAliasDeclaration} from "typescript";

export function checkTypeAliasDeclaration({node, continuation}: ReferenceVisitorOptions<TypeAliasDeclaration>): boolean {
	if (node.typeParameters != null) {
		for (const typeParameter of node.typeParameters) {
			if (continuation(typeParameter)) return true;
		}
	}

	if (continuation(node.type)) return true;

	return false;
}
