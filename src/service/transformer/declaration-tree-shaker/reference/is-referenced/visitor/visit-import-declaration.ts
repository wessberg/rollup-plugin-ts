import {ImportDeclaration} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given ImportDeclaration.
 * @param {ImportDeclaration} _currentNode
 * @param {VisitorOptions} _options
 * @returns {boolean}
 */
export function visitImportDeclaration(_currentNode: ImportDeclaration, _options: VisitorOptions): void {
	// An ImportDeclaration may reference an identifier of the Node, but it shouldn't be enough to preserve it
	// since the Import may exist only to define the Node within the scope
}
