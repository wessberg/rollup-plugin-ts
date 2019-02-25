import {VariableDeclarationList} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given VariableDeclarationList.
 * @param {VariableDeclarationList} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkVariableDeclarationList(currentNode: VariableDeclarationList, {continuation}: ReferenceVisitorOptions): boolean {
	// Check if any of the declaration references the Node
	for (const declaration of currentNode.declarations) {
		if (continuation(declaration)) return true;
	}

	return false;
}
