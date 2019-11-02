import {isStringLiteralLike, NamespaceImport} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given NamespaceImport.
 * @param {TraceIdentifiersVisitorOptions} options
 */
export function traceIdentifiersForNamespaceImport({
	node,
	sourceFile,
	resolver,
	addIdentifier
}: TraceIdentifiersVisitorOptions<NamespaceImport>): void {
	const moduleSpecifier = node.parent == null || node.parent.parent == null ? undefined : node.parent.parent.moduleSpecifier;

	if (node.name != null) {
		addIdentifier(node.name.text, {
			deconflictedName: undefined,
			originalModule:
				moduleSpecifier == null || !isStringLiteralLike(moduleSpecifier) ? sourceFile.fileName : resolver(moduleSpecifier.text, sourceFile.fileName)
		});
	}
}
