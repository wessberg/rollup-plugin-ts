import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {EnumDeclaration} from "typescript";

export function checkEnumDeclaration({node, childContinuation}: ReferenceVisitorOptions<EnumDeclaration>): boolean {
	for (const member of node.members) {
		if (childContinuation(member)) return true;
	}

	return false;
}
