import {SyntaxKind, Token} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given Token.
 * @param {Token} _currentNode
 * @param {VisitorOptions} _options
 * @returns {boolean}
 */
export function checkToken<TKind extends SyntaxKind>(_currentNode: Token<TKind>, _options: ReferenceVisitorOptions): boolean {
	// A Token can never reference an identifier
	return false;
}
