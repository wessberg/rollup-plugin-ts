import {TypeAliasDeclaration} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";
import {normalize} from "path";

/**
 * Traces identifiers for the given TypeAliasDeclaration.
 * @param {TraceIdentifiersVisitorOptions} options
 */
export function traceIdentifiersForTypeAliasDeclaration({
	node,
	sourceFile,
	addIdentifier
}: TraceIdentifiersVisitorOptions<TypeAliasDeclaration>): void {
	if (node.name == null) return;

	addIdentifier(node.name.text, {
		originalModule: normalize(sourceFile.fileName),
		deconflictedName: undefined
	});
}
