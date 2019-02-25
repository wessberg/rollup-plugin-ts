import {isComputedPropertyName, MethodSignature} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given MethodSignature.
 * @param {MethodSignature} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkMethodSignature(currentNode: MethodSignature, {continuation}: ReferenceVisitorOptions): boolean {
	// Check if any of the type parameters references the Node
	if (currentNode.typeParameters != null) {
		for (const typeParameter of currentNode.typeParameters) {
			if (continuation(typeParameter)) return true;
		}
	}

	// Check if any of the parameters references the node
	if (currentNode.parameters != null) {
		for (const parameter of currentNode.parameters) {
			if (continuation(parameter)) return true;
		}
	}

	// Check if the type of the function references the Node
	if (currentNode.type != null && continuation(currentNode.type)) {
		return true;
	}

	if (isComputedPropertyName(currentNode.name) && continuation(currentNode.name)) {
		return true;
	}

	return false;
}
