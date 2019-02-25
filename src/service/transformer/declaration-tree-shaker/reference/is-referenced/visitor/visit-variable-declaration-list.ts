import {VariableDeclarationList} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given VariableDeclarationList.
 * @param {VariableDeclarationList} currentNode
 * @param {VisitorOptions} options
 */
export function visitVariableDeclarationList(currentNode: VariableDeclarationList, {continuation}: VisitorOptions): void {
	// Check if any of the declaration references the Node
	for (const declaration of currentNode.declarations) {
		continuation(declaration);
	}
}
