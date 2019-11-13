import {ImportClause, isStringLiteralLike} from "typescript";
import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";
import {normalize} from "path";

/**
 * Traces identifiers for the given ImportClause.
 * @param {TraceIdentifiersVisitorOptions} options
 */
export function traceIdentifiersForImportClause({
	node,
	sourceFile,
	resolver,
	addIdentifier,
	continuation
}: TraceIdentifiersVisitorOptions<ImportClause>): void {
	const moduleSpecifier = node.parent == null ? undefined : node.parent.moduleSpecifier;
	if (node.name != null) {
		addIdentifier(node.name.text, {
			deconflictedName: undefined,
			originalModule: normalize(
				moduleSpecifier == null || !isStringLiteralLike(moduleSpecifier)
					? sourceFile.fileName
					: resolver(moduleSpecifier.text, sourceFile.fileName) ?? sourceFile.fileName
			)
		});
	}

	if (node.namedBindings != null) {
		return continuation(node.namedBindings);
	}
}
