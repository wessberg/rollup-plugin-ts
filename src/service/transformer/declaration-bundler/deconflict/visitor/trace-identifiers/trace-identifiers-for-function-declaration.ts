import {FunctionDeclaration} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given FunctionDeclaration.
 * @param {TraceIdentifiersVisitorOptions} options
 */
export function traceIdentifiersForFunctionDeclaration({
	node,
	isIdentifierFree,
	updateIdentifierName,
	addIdentifier,
	generateUniqueVariableName
}: TraceIdentifiersVisitorOptions<FunctionDeclaration>): void {
	if (node.name == null) return;
	const newName = !isIdentifierFree(node.name.text) ? generateUniqueVariableName(node.name.text) : node.name.text;

	addIdentifier(newName);

	if (newName !== node.name.text) {
		updateIdentifierName(node.name.text, newName);
	}
}
