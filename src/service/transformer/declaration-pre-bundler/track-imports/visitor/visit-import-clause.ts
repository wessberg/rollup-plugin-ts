import {ImportClause, isStringLiteralLike} from "typescript";
import {TrackImportsVisitorOptions} from "../track-imports-visitor-options";

/**
 * Visits the given ImportClause.
 * @param {TrackImportsVisitorOptions<ImportClause>} options
 * @returns {ImportClause | undefined}
 */
export function visitImportClause({
	node,
	sourceFile,
	resolver,
	markAsImported,
	continuation
}: TrackImportsVisitorOptions<ImportClause>): ImportClause | undefined {
	const moduleSpecifier = node.parent == null ? undefined : node.parent.moduleSpecifier;

	// If the ImportClause has a name, that will be the local binding of the default export of the module being imported.
	if (node.name != null) {
		markAsImported({
			node: node.name,
			originalModule:
				moduleSpecifier == null || !isStringLiteralLike(moduleSpecifier) ? sourceFile.fileName : resolver(moduleSpecifier.text, sourceFile.fileName),
			defaultImport: true,
			name: node.name.text,
			propertyName: undefined
		});
	}

	// If there is an export clause, this is something like 'export {...} [from "..."]'.
	// We'll let other visitors handle such cases.
	if (node.namedBindings != null) {
		continuation(node.namedBindings);
	}

	// Leave out the import
	return undefined;
}
