import {EnumDeclaration} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given EnumDeclaration.
 * @param {TraceIdentifiersVisitorOptions} options
 * @returns {void}
 */
export function traceIdentifiersForEnumDeclaration({node, sourceFile, addIdentifier}: TraceIdentifiersVisitorOptions<EnumDeclaration>): void {
	addIdentifier(node.name.text, {
		originalModule: sourceFile.fileName,
		deconflictedName: undefined
	});
}
