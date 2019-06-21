import {Identifier} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Deconflicts the given Identifier.
 * @param {TraceIdentifiersVisitorOptions} options
 */
export function traceIdentifiersForIdentifier({
	node,
	isIdentifierFree,
	generateUniqueVariableName,
	addIdentifier,
	updateIdentifierName
}: TraceIdentifiersVisitorOptions<Identifier>): void {
	const newName = !isIdentifierFree(node.text) ? generateUniqueVariableName(node.text) : node.text;

	addIdentifier(newName);

	if (newName !== node.text) {
		updateIdentifierName(node.text, newName);
	}
}
