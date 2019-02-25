import {BindingElement, isIdentifier} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given BindingElement.
 * @param {BindingElement} currentNode
 * @param {VisitorOptions} options
 */
export function visitBindingElement(currentNode: BindingElement, {continuation}: VisitorOptions): void {
	if (currentNode.initializer != null) {
		continuation(currentNode.initializer);
	}

	if (!isIdentifier(currentNode.name)) {
		continuation(currentNode.name);
	}
}
