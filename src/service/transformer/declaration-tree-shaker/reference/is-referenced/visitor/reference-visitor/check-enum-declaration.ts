import {EnumDeclaration} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given EnumDeclaration.
 * @param {EnumDeclaration} currentNode
 * @param {ReferenceVisitorOptions} options
 */
export function checkEnumDeclaration(currentNode: EnumDeclaration, {continuation}: ReferenceVisitorOptions): boolean {
	for (const member of currentNode.members) {
		if (continuation(member)) return true;
	}

	return false;
}
