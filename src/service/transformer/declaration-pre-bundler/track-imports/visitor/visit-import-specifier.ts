import {ImportSpecifier, isStringLiteralLike} from "typescript";
import {TrackImportsVisitorOptions} from "../track-imports-visitor-options";
import {isExternalLibrary} from "../../../../../util/path/path-util";
import {getAliasedDeclaration} from "../../util/symbol/get-aliased-declaration";
import {normalize} from "path";

/**
 * Visits the given ImportSpecifier.
 * @param {TrackImportsVisitorOptions<ImportSpecifier>} options
 * @returns {ImportSpecifier | undefined}
 */
export function visitImportSpecifier({
	node,
	sourceFile,
	resolver,
	markAsImported,
	typeChecker,
	getCurrentModuleSpecifier
}: TrackImportsVisitorOptions<ImportSpecifier>): ImportSpecifier | undefined {
	const moduleSpecifier = getCurrentModuleSpecifier();

	const originalModule = normalize(
		moduleSpecifier == null || !isStringLiteralLike(moduleSpecifier)
			? sourceFile.fileName
			: resolver(moduleSpecifier.text, sourceFile.fileName) ?? sourceFile.fileName
	);
	const rawModuleSpecifier = moduleSpecifier == null || !isStringLiteralLike(moduleSpecifier) ? undefined : moduleSpecifier.text;
	const declaration = getAliasedDeclaration(node.propertyName ?? node.name, typeChecker);

	markAsImported({
		node: declaration ?? node,
		originalModule,
		rawModuleSpecifier,
		isExternal: rawModuleSpecifier != null && isExternalLibrary(rawModuleSpecifier),
		defaultImport: false,
		name: node.name.text,
		propertyName: node.propertyName == null ? undefined : node.propertyName.text
	});

	// Leave out the ImportSpecifier
	return undefined;
}
