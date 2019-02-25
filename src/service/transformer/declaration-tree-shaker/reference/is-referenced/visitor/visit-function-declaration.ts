import {FunctionDeclaration} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given FunctionDeclaration.
 * @param {FunctionDeclaration} currentNode
 * @param {VisitorOptions} options
 */
export function visitFunctionDeclaration(currentNode: FunctionDeclaration, {continuation}: VisitorOptions): void {
	// Check if any of the type parameters references the Node
	if (currentNode.typeParameters != null) {
		for (const typeParameter of currentNode.typeParameters) {
			continuation(typeParameter, currentNode);
		}
	}

	// Check if any of the parameters references the node
	if (currentNode.parameters != null) {
		for (const parameter of currentNode.parameters) {
			continuation(parameter, currentNode);
		}
	}

	// Check if the type of the function references the Node
	if (currentNode.type != null) {
		continuation(currentNode.type, currentNode);
	}

	// Check if the body references the Node
	if (currentNode.body != null) {
		continuation(currentNode.body, currentNode);
	}
}
