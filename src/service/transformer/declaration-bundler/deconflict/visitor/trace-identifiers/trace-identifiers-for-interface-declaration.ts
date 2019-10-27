import {InterfaceDeclaration} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given InterfaceDeclaration.
 * @param {TraceIdentifiersVisitorOptions} options
 */
export function traceIdentifiersForInterfaceDeclaration({
	node,
	sourceFile,
	addIdentifier
}: TraceIdentifiersVisitorOptions<InterfaceDeclaration>): void {
	addIdentifier(node.name.text, {
		originalModule: sourceFile.fileName
	});
}
