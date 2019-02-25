import {BindingElement, isIdentifier} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Deconflicts the given BindingElement.
 * @param {TraceIdentifiersVisitorOptions} options
 */
export function traceIdentifiersForBindingElement({
	node,
	isIdentifierFree,
	continuation,
	addIdentifier,
	updateIdentifierName,
	generateUniqueVariableName
}: TraceIdentifiersVisitorOptions<BindingElement>): void {
	if (node.name == null) return;

	if (!isIdentifier(node.name)) return continuation(node.name);

	const newName = !isIdentifierFree(node.name.text) ? generateUniqueVariableName(node.name.text) : node.name.text;

	addIdentifier(newName);

	if (newName !== node.name.text) {
		updateIdentifierName(node.name.text, newName);
	}
}
