import {EnumMember, isComputedPropertyName} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given EnumMember.
 * @param {EnumMember} currentNode
 * @param {VisitorOptions} options
 */
export function visitEnumMember(currentNode: EnumMember, {continuation}: VisitorOptions): void {
	// Check if the initializer references the Node
	if (currentNode.initializer != null) {
		continuation(currentNode.initializer);
	}

	// Check if the name is a binding pattern that references the identifier
	if (isComputedPropertyName(currentNode.name)) {
		continuation(currentNode.name);
	}
}
