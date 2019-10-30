import {FunctionDeclaration} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given FunctionDeclaration.
 * @param {TraceIdentifiersVisitorOptions} options
 */
export function traceIdentifiersForFunctionDeclaration({node, sourceFile, addIdentifier}: TraceIdentifiersVisitorOptions<FunctionDeclaration>): void {
	if (node.name == null) return;
	addIdentifier(node.name.text, {
		originalModule: sourceFile.fileName
	});
}
