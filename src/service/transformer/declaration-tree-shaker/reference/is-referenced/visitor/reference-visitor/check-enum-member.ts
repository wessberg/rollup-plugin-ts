import {EnumMember, isComputedPropertyName} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given EnumMember.
 * @param {EnumMember} currentNode
 * @param {ReferenceVisitorOptions} options
 */
export function checkEnumMember(currentNode: EnumMember, {continuation}: ReferenceVisitorOptions): boolean {
	// Check if the initializer references the Node
	if (currentNode.initializer != null && continuation(currentNode.initializer)) {
		return true;
	}

	// Check if the name is a binding pattern that references the identifier
	if (isComputedPropertyName(currentNode.name) && continuation(currentNode.name)) {
		return true;
	}

	return false;
}
