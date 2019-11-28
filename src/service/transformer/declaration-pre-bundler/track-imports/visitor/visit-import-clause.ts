import {TrackImportsVisitorOptions} from "../track-imports-visitor-options";
import {isExternalLibrary} from "../../../../../util/path/path-util";
import {getAliasedDeclaration} from "../../util/symbol/get-aliased-declaration";
import {normalize} from "path";
import {TS} from "../../../../../type/ts";

/**
 * Visits the given ImportClause.
 */
export function visitImportClause({
	node,
	sourceFile,
	resolver,
	markAsImported,
	continuation,
	typeChecker,
	getCurrentModuleSpecifier,
	typescript
}: TrackImportsVisitorOptions<TS.ImportClause>): TS.ImportClause | undefined {
	const moduleSpecifier = getCurrentModuleSpecifier();

	const originalModule = normalize(
		moduleSpecifier == null || !typescript.isStringLiteralLike(moduleSpecifier)
			? sourceFile.fileName
			: resolver(moduleSpecifier.text, sourceFile.fileName) ?? sourceFile.fileName
	);
	const rawModuleSpecifier = moduleSpecifier == null || !typescript.isStringLiteralLike(moduleSpecifier) ? undefined : moduleSpecifier.text;

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
