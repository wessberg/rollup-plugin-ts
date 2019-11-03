import {ImportClause, isStringLiteralLike} from "typescript";
import {TrackImportsVisitorOptions} from "../track-imports-visitor-options";
import {isExternalLibrary} from "../../../../../util/path/path-util";
import {getAliasedDeclaration} from "../../util/symbol/get-aliased-declaration";

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
	continuation,
	typeChecker
}: TrackImportsVisitorOptions<ImportClause>): ImportClause | undefined {
	const moduleSpecifier = node.parent == null ? undefined : node.parent.moduleSpecifier;

	const originalModule = moduleSpecifier == null || !isStringLiteralLike(moduleSpecifier) ? sourceFile.fileName : resolver(moduleSpecifier.text, sourceFile.fileName) ?? sourceFile.fileName;
	const rawModuleSpecifier = moduleSpecifier == null || !isStringLiteralLike(moduleSpecifier) ? undefined : moduleSpecifier.text;

	// If the ImportClause has a name, that will be the local binding of the default export of the module being imported.
	if (node.name != null) {
		const declaration = getAliasedDeclaration(node.name, typeChecker);
		markAsImported({
			node: declaration ?? node,
			originalModule,
			rawModuleSpecifier,
			isExternal: rawModuleSpecifier != null && isExternalLibrary(rawModuleSpecifier),
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
