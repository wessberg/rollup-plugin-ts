import {CallSignatureDeclaration, isComputedPropertyName} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given CallSignatureDeclaration.
 * @param {CallSignatureDeclaration} currentNode
 * @param {VisitorOptions} options
 */
export function visitCallSignatureDeclaration(currentNode: CallSignatureDeclaration, {continuation}: VisitorOptions): void {
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

	if (currentNode.name != null && isComputedPropertyName(currentNode.name)) {
		continuation(currentNode.name);
	}
}
