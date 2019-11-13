import {Identifier} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";
import {normalize} from "path";

/**
 * Deconflicts the given Identifier.
 * @param {TraceIdentifiersVisitorOptions} options
 */
export function traceIdentifiersForIdentifier({node, sourceFile, addIdentifier}: TraceIdentifiersVisitorOptions<Identifier>): void {
	addIdentifier(node.text, {
		originalModule: normalize(sourceFile.fileName),
		deconflictedName: undefined
	});
}
