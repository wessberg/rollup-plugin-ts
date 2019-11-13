import {InterfaceDeclaration} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";
import {normalize} from "path";

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
		originalModule: normalize(sourceFile.fileName),
		deconflictedName: undefined
	});
}
