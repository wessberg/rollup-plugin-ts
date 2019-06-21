import {ClassDeclaration} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given ClassDeclaration.
 * @param {TraceIdentifiersVisitorOptions} options
 * @returns {void}
 */
export function traceIdentifiersForClassDeclaration({
	node,
	isIdentifierFree,
	updateIdentifierName,
	addIdentifier,
	generateUniqueVariableName
}: TraceIdentifiersVisitorOptions<ClassDeclaration>): void {
	if (node.name == null) return;
	const newName = !isIdentifierFree(node.name.text) ? generateUniqueVariableName(node.name.text) : node.name.text;

	addIdentifier(newName);

	if (newName !== node.name.text) {
		updateIdentifierName(node.name.text, newName);
	}
}
