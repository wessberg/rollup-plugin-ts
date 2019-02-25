import {BindingElement, isIdentifier} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given BindingElement.
 * @param {BindingElement} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkBindingElement(currentNode: BindingElement, {continuation}: ReferenceVisitorOptions): boolean {
	if (currentNode.initializer != null && continuation(currentNode.initializer)) {
		return true;
	}

	currentNode.propertyName;
	if (!isIdentifier(currentNode.name) && continuation(currentNode.name)) {
		return true;
	}

	return false;
}
