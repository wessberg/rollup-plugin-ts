import {isStringLiteralLike, NamespaceImport} from "typescript";
import {TrackImportsVisitorOptions} from "../track-imports-visitor-options";

/**
 * Visits the given NamespaceImport.
 * @param {TrackImportsVisitorOptions<NamespaceImport>} options
 * @returns {NamespaceImport | undefined}
 */
export function visitNamespaceImport({
	node,
	sourceFile,
	resolver,
	markAsImported
}: TrackImportsVisitorOptions<NamespaceImport>): NamespaceImport | undefined {
	const moduleSpecifier = node.parent == null || node.parent.parent == null ? undefined : node.parent.parent.moduleSpecifier;

	// If the ImportClause has a name, that will be the local binding of the default export of the module being imported.
	markAsImported({
		node,
		originalModule:
			moduleSpecifier == null || !isStringLiteralLike(moduleSpecifier) ? sourceFile.fileName : resolver(moduleSpecifier.text, sourceFile.fileName),
		namespaceImport: true,
		name: node.name.text
	});

	// Leave out the import
	return undefined;
}
