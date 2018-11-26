import {Identifier, SyntaxKind} from "typescript";

/**
 * Returns true if the identifier is used for a left-hand expression such as a PropertyAssignment.
 * @param {Identifier} identifier
 * @returns {boolean}
 */
export function isLeftHandIdentifier (identifier: Identifier): boolean {
	switch (identifier.parent.kind) {

		// For example '{identifier: value}'
		case SyntaxKind.PropertyAssignment:

		// For example 'let identifier = true'
		case SyntaxKind.VariableDeclaration:

		// For example 'const {thingy} = {thingy: 123}'
		case SyntaxKind.BindingElement:

		// For example 'function identifier () {...}'
		case SyntaxKind.FunctionDeclaration:
			return true;

		default:
			return false;
	}
}