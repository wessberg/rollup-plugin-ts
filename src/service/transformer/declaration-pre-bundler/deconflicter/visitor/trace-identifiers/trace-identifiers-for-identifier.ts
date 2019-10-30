import {Identifier} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Deconflicts the given Identifier.
 * @param {TraceIdentifiersVisitorOptions} options
 */
export function traceIdentifiersForIdentifier({node, sourceFile, addIdentifier}: TraceIdentifiersVisitorOptions<Identifier>): void {
	addIdentifier(node.text, {
		originalModule: sourceFile.fileName
	});
}
