import {VariableDeclaration} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given VariableDeclaration.
 * @param {VariableDeclaration} currentNode
 * @param {VisitorOptions} options
 */
export function visitVariableDeclaration(currentNode: VariableDeclaration, {continuation}: VisitorOptions): void {
	// Check if the initializer references the Node
	if (currentNode.initializer != null) {
		continuation(currentNode.initializer, currentNode);
	}

	// Check if the type references the Node
	if (currentNode.type != null) {
		continuation(currentNode.type, currentNode);
	}
}
