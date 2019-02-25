import {TypeAliasDeclaration} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given TypeAliasDeclaration.
 * @param {TypeAliasDeclaration} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkTypeAliasDeclaration(currentNode: TypeAliasDeclaration, {continuation}: ReferenceVisitorOptions): boolean {
	// Check if any of the type parameters references the Node
	if (currentNode.typeParameters != null) {
		for (const typeParameter of currentNode.typeParameters) {
			if (continuation(typeParameter)) return true;
		}
	}

	return continuation(currentNode.type);
}
