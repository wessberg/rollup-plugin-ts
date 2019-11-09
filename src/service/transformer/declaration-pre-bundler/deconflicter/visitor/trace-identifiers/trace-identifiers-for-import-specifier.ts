import {ImportSpecifier, isStringLiteralLike} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given ImportSpecifier.
 * @param {TraceIdentifiersVisitorOptions} options
 */
export function traceIdentifiersForImportSpecifier({
	node,
	sourceFile,
	resolver,
	addIdentifier
}: TraceIdentifiersVisitorOptions<ImportSpecifier>): void {
	const moduleSpecifier =
		node.parent == null || node.parent.parent == null || node.parent.parent.parent == null ? undefined : node.parent.parent.parent.moduleSpecifier;

	addIdentifier(node.name.text, {
		deconflictedName: undefined,
		originalModule:
			moduleSpecifier == null || !isStringLiteralLike(moduleSpecifier) ? sourceFile.fileName : resolver(moduleSpecifier.text, sourceFile.fileName)
	});
}
