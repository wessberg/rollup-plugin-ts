import {SyntaxKind, Token} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given Token.
 * @param {Token} _currentNode
 * @param {VisitorOptions} _options
 */
export function visitToken<TKind extends SyntaxKind>(_currentNode: Token<TKind>, _options: VisitorOptions): void {
	// A Token can never reference an identifier
}
