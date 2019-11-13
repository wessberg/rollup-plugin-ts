import {ClassDeclaration} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";
import {normalize} from "path";

/**
 * Traces identifiers for the given ClassDeclaration.
 * @param {TraceIdentifiersVisitorOptions} options
 * @returns {void}
 */
export function traceIdentifiersForClassDeclaration({node, sourceFile, addIdentifier}: TraceIdentifiersVisitorOptions<ClassDeclaration>): void {
	if (node.name == null) return;

	addIdentifier(node.name.text, {
		originalModule: normalize(sourceFile.fileName),
		deconflictedName: undefined
	});
}
