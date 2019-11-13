import {EnumDeclaration} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";
import {normalize} from "path";

/**
 * Traces identifiers for the given EnumDeclaration.
 * @param {TraceIdentifiersVisitorOptions} options
 * @returns {void}
 */
export function traceIdentifiersForEnumDeclaration({node, sourceFile, addIdentifier}: TraceIdentifiersVisitorOptions<EnumDeclaration>): void {
	addIdentifier(node.name.text, {
		originalModule: normalize(sourceFile.fileName),
		deconflictedName: undefined
	});
}
