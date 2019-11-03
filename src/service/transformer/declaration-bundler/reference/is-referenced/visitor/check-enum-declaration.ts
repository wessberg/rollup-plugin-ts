import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {EnumDeclaration} from "typescript";

export function checkEnumDeclaration({node, continuation}: ReferenceVisitorOptions<EnumDeclaration>): boolean {
	for (const member of node.members) {
		if (continuation(member)) return true;
	}

	return false;
}
