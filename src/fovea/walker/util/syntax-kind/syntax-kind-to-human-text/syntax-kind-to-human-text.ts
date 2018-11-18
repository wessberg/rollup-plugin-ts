import {SyntaxKind} from "typescript";

/**
 * Generates a human-readable string based on the given SyntaxKind.
 * This is useful to make it easier to understand what what a given SyntaxKind represents
 * @param {SyntaxKind} kind
 * @param {boolean} [plural=false]
 * @returns {string}
 */
export function syntaxKindToHumanText (kind: SyntaxKind, plural: boolean = false): string {
	switch (kind) {

		case SyntaxKind.ClassDeclaration:
		case SyntaxKind.ClassExpression:
			return plural ? "classes" : "class";

		case SyntaxKind.PropertyDeclaration:
			return plural ? "properties" : "property";

		case SyntaxKind.MethodDeclaration:
			return plural ? "methods" : "method";

		case SyntaxKind.FunctionDeclaration:
		case SyntaxKind.FunctionExpression:
		case SyntaxKind.ArrowFunction:
			return plural ? "functions" : "function";

		default:
			return SyntaxKind[kind];
	}
}