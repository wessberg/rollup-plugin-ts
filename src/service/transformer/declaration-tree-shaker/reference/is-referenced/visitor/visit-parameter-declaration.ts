import {isIdentifier, ParameterDeclaration} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given ParameterDeclaration.
 * @param {ParameterDeclaration} currentNode
 * @param {VisitorOptions} options
 */
export function visitParameterDeclaration(currentNode: ParameterDeclaration, {continuation}: VisitorOptions): void {
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
