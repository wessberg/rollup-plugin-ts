import {isIdentifier, ParameterDeclaration} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given ParameterDeclaration.
 * @param {ParameterDeclaration} currentNode
 * @param {ReferenceVisitorOptions} options
 */
export function checkParameterDeclaration(currentNode: ParameterDeclaration, {continuation}: ReferenceVisitorOptions): boolean {
	// Check if the initializer references the Node
	if (currentNode.initializer != null && continuation(currentNode.initializer)) {
		return true;
	}

	// Check if the type references the Node
	if (currentNode.type != null && continuation(currentNode.type)) {
		return true;
	}

	// Check if the name is a binding pattern that references the identifier
	if (!isIdentifier(currentNode.name) && continuation(currentNode.name)) {
		return true;
	}

	return false;
}
