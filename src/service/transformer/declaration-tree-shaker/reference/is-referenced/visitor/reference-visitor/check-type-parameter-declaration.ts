import {TypeParameterDeclaration} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given TypeParameterDeclaration.
 * @param {TypeParameterDeclaration} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkTypeParameterDeclaration(currentNode: TypeParameterDeclaration, {continuation}: ReferenceVisitorOptions): boolean {
	if (currentNode.constraint != null && continuation(currentNode.constraint)) {
		return true;
	}

	if (currentNode.default != null && continuation(currentNode.default)) {
		return true;
	}

	if (currentNode.expression != null && continuation(currentNode.expression)) {
		return true;
	}

	return continuation(currentNode.name);
}
