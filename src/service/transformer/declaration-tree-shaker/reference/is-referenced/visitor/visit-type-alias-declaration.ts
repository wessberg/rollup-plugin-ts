import {TypeAliasDeclaration} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given TypeAliasDeclaration.
 * @param {TypeAliasDeclaration} currentNode
 * @param {VisitorOptions} options
 */
export function visitTypeAliasDeclaration(currentNode: TypeAliasDeclaration, {continuation}: VisitorOptions): void {
	// Check if any of the type parameters references the Node
	if (currentNode.typeParameters != null) {
		for (const typeParameter of currentNode.typeParameters) {
			continuation(typeParameter);
		}
	}

	continuation(currentNode.type);
}
