import {TypeParameterDeclaration} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given TypeParameterDeclaration.
 * @param {TypeParameterDeclaration} currentNode
 * @param {VisitorOptions} options
 */
export function visitTypeParameterDeclaration(currentNode: TypeParameterDeclaration, {continuation}: VisitorOptions): void {
	if (currentNode.constraint != null) {
		continuation(currentNode.constraint);
	}

	if (currentNode.default != null) {
		continuation(currentNode.default);
	}

	if (currentNode.expression != null) {
		continuation(currentNode.expression);
	}

	continuation(currentNode.name);
}
