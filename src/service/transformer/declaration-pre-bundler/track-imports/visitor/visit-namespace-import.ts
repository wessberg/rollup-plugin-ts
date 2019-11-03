import {isStringLiteralLike, NamespaceImport} from "typescript";
import {TrackImportsVisitorOptions} from "../track-imports-visitor-options";
import {isExternalLibrary} from "../../../../../util/path/path-util";
import {getAliasedDeclaration} from "../../util/symbol/get-aliased-declaration";

/**
 * Visits the given NamespaceImport.
 * @param {TrackImportsVisitorOptions<NamespaceImport>} options
 * @returns {NamespaceImport | undefined}
 */
export function visitNamespaceImport({
	node,
	sourceFile,
	resolver,
	markAsImported,
	typeChecker
}: TrackImportsVisitorOptions<NamespaceImport>): NamespaceImport | undefined {
	const moduleSpecifier = node.parent == null || node.parent.parent == null ? undefined : node.parent.parent.moduleSpecifier;
	const originalModule = moduleSpecifier == null || !isStringLiteralLike(moduleSpecifier) ? sourceFile.fileName : resolver(moduleSpecifier.text, sourceFile.fileName) ?? sourceFile.fileName;
	const rawModuleSpecifier = moduleSpecifier == null || !isStringLiteralLike(moduleSpecifier) ? undefined : moduleSpecifier.text;
	const declaration = getAliasedDeclaration(node.name, typeChecker);

	// If the ImportClause has a name, that will be the local binding of the default export of the module being imported.
	markAsImported({
		node: declaration ?? node,
		originalModule,
		rawModuleSpecifier,
		isExternal: rawModuleSpecifier != null && isExternalLibrary(rawModuleSpecifier),
		namespaceImport: true,
		name: node.name.text
	});

	// Leave out the import
	return undefined;
}
