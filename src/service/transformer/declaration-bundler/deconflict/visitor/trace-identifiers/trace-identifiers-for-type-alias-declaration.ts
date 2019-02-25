import {TypeAliasDeclaration} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given TypeAliasDeclaration.
 * @param {TraceIdentifiersVisitorOptions} options
 */
export function traceIdentifiersForTypeAliasDeclaration({
	node,
	isIdentifierFree,
	addIdentifier,
	updateIdentifierName,
	generateUniqueVariableName
}: TraceIdentifiersVisitorOptions<TypeAliasDeclaration>): void {
	const newName = !isIdentifierFree(node.name.text) ? generateUniqueVariableName(node.name.text) : node.name.text;

	addIdentifier(newName);

	if (newName !== node.name.text) {
		updateIdentifierName(node.name.text, newName);
	}
}
