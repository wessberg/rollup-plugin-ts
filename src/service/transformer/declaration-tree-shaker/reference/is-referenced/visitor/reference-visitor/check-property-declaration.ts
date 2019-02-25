import {isComputedPropertyName, PropertyDeclaration} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given PropertyDeclaration.
 * @param {PropertyDeclaration} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkPropertyDeclaration(currentNode: PropertyDeclaration, {continuation}: ReferenceVisitorOptions): boolean {
	// Check if the initializer references the Node
	if (currentNode.initializer != null && continuation(currentNode.initializer)) {
		return true;
	}

	// Check if the type references the Node
	if (currentNode.type != null && continuation(currentNode.type)) {
		return true;
	}

	// Check if the name is a binding pattern that references the identifier
	if (isComputedPropertyName(currentNode.name) && continuation(currentNode.name)) {
		return true;
	}

	return false;
}
