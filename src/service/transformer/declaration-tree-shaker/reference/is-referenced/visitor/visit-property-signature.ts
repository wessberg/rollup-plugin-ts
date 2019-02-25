import {isComputedPropertyName, PropertySignature} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given PropertySignature.
 * @param {PropertySignature} currentNode
 * @param {VisitorOptions} options
 */
export function visitPropertySignature(currentNode: PropertySignature, {continuation}: VisitorOptions): void {
	if (currentNode.initializer != null) {
		continuation(currentNode.initializer);
	}

	if (currentNode.type != null) {
		continuation(currentNode.type);
	}

	if (isComputedPropertyName(currentNode.name)) {
		continuation(currentNode.name);
	}
}
