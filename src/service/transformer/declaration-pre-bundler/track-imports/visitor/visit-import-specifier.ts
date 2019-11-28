import {TrackImportsVisitorOptions} from "../track-imports-visitor-options";
import {isExternalLibrary} from "../../../../../util/path/path-util";
import {getAliasedDeclaration} from "../../util/symbol/get-aliased-declaration";
import {normalize} from "path";
import {TS} from "../../../../../type/ts";

/**
 * Visits the given ImportSpecifier.
 */
export function visitImportSpecifier({
	node,
	sourceFile,
	resolver,
	markAsImported,
	typeChecker,
	getCurrentModuleSpecifier,
	typescript
}: TrackImportsVisitorOptions<TS.ImportSpecifier>): TS.ImportSpecifier | undefined {
	const moduleSpecifier = getCurrentModuleSpecifier();

	const originalModule = normalize(
		moduleSpecifier == null || !typescript.isStringLiteralLike(moduleSpecifier)
			? sourceFile.fileName
			: resolver(moduleSpecifier.text, sourceFile.fileName) ?? sourceFile.fileName
	);
	const rawModuleSpecifier = moduleSpecifier == null || !typescript.isStringLiteralLike(moduleSpecifier) ? undefined : moduleSpecifier.text;
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
