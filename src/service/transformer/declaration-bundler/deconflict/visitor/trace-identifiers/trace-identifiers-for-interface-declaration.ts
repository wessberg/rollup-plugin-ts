import {InterfaceDeclaration} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given InterfaceDeclaration.
 * @param {TraceIdentifiersVisitorOptions} options
 */
export function traceIdentifiersForInterfaceDeclaration({
	node,
	isIdentifierFree,
	updateIdentifierName,
	addIdentifier,
	generateUniqueVariableName
}: TraceIdentifiersVisitorOptions<InterfaceDeclaration>): void {
	const newName = !isIdentifierFree(node.name.text) ? generateUniqueVariableName(node.name.text) : node.name.text;

	addIdentifier(newName);

	if (newName !== node.name.text) {
		updateIdentifierName(node.name.text, newName);
	}
}
