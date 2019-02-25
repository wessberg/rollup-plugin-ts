import {FunctionTypeNode, isIdentifier} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given FunctionTypeNode.
 * @param {FunctionTypeNode} currentNode
 * @param {VisitorOptions} options
 */
export function visitFunctionTypeNode(currentNode: FunctionTypeNode, {continuation}: VisitorOptions): void {
	// Check if any of the type parameters references the Node
	if (currentNode.typeParameters != null) {
		for (const typeParameter of currentNode.typeParameters) {
			continuation(typeParameter);
		}
	}

	// Check if any of the parameters references the node
	if (currentNode.parameters != null) {
		for (const parameter of currentNode.parameters) {
			continuation(parameter);
		}
	}

	// Check if the type of the function references the Node
	if (currentNode.type != null) {
		continuation(currentNode.type);
	}

	// Check if the name is a binding pattern that references the identifier
	if (currentNode.name != null && !isIdentifier(currentNode.name)) {
		continuation(currentNode.name);
	}
}
