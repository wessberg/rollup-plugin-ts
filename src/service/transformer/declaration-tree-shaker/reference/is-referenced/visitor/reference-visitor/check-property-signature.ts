import {isComputedPropertyName, PropertySignature} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given PropertySignature.
 * @param {PropertySignature} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkPropertySignature(currentNode: PropertySignature, {continuation}: ReferenceVisitorOptions): boolean {
	if (currentNode.initializer != null && continuation(currentNode.initializer)) {
		return true;
	}

	if (currentNode.type != null && continuation(currentNode.type)) {
		return true;
	}

	if (isComputedPropertyName(currentNode.name) && continuation(currentNode.name)) {
		return true;
	}

	return false;
}
