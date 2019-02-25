import {VariableDeclaration} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given VariableDeclaration.
 * @param {VariableDeclaration} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkVariableDeclaration(currentNode: VariableDeclaration, {continuation}: ReferenceVisitorOptions): boolean {
	// Check if the initializer references the Node
	if (currentNode.initializer != null && continuation(currentNode.initializer)) {
		return true;
	}

	// Check if the type references the Node
	if (currentNode.type != null && continuation(currentNode.type)) {
		return true;
	}

	return false;
}
