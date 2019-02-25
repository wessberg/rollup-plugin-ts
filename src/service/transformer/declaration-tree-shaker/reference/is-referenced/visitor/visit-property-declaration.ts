import {isIdentifier, PropertyDeclaration} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given PropertyDeclaration.
 * @param {PropertyDeclaration} currentNode
 * @param {VisitorOptions} options
 */
export function visitPropertyDeclaration(currentNode: PropertyDeclaration, {continuation}: VisitorOptions): void {
	// Check if the initializer references the Node
	if (currentNode.initializer != null) {
		continuation(currentNode.initializer);
	}

	// Check if the type references the Node
	if (currentNode.type != null) {
		continuation(currentNode.type);
	}

	// Check if the name is a binding pattern that references the identifier
	if (!isIdentifier(currentNode.name)) {
		continuation(currentNode.name);
	}
}
