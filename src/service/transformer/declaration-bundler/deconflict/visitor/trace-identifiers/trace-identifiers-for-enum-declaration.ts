import {EnumDeclaration} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given EnumDeclaration.
 * @param {TraceIdentifiersVisitorOptions} options
 * @returns {void}
 */
export function traceIdentifiersForEnumDeclaration({node, isIdentifierFree, addIdentifier, updateIdentifierName, generateUniqueVariableName}: TraceIdentifiersVisitorOptions<EnumDeclaration>): void {
	const newName = !isIdentifierFree(node.name.text) ? generateUniqueVariableName(node.name.text) : node.name.text;

	addIdentifier(newName);

	if (newName !== node.name.text) {
		updateIdentifierName(node.name.text, newName);
	}
}
