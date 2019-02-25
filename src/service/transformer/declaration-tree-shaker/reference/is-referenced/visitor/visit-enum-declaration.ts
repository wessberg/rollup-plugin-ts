import {EnumDeclaration} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given EnumDeclaration.
 * @param {EnumDeclaration} currentNode
 * @param {VisitorOptions} options
 */
export function visitEnumDeclaration(currentNode: EnumDeclaration, {continuation}: VisitorOptions): void {
	for (const member of currentNode.members) {
		continuation(member, currentNode);
	}
}
