import {ExportSpecifier, isStringLiteralLike} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {isExternalLibrary} from "../../../../../util/path/path-util";

/**
 * Visits the given ExportSpecifier.
 * @param {TrackExportsVisitorOptions<ExportSpecifier>} options
 * @returns {ExportSpecifier | undefined}
 */
export function visitExportSpecifier({
	node,
	sourceFile,
	resolver,
	markAsExported,
	getDeconflictedNameAndPropertyName,
	getCurrentModuleSpecifier
}: TrackExportsVisitorOptions<ExportSpecifier>): ExportSpecifier | undefined {
	const moduleSpecifier = getCurrentModuleSpecifier();
	const originalModule =
		moduleSpecifier == null || !isStringLiteralLike(moduleSpecifier)
			? sourceFile.fileName
			: resolver(moduleSpecifier.text, sourceFile.fileName) ?? sourceFile.fileName;
	const rawModuleSpecifier = moduleSpecifier == null || !isStringLiteralLike(moduleSpecifier) ? undefined : moduleSpecifier.text;
	const [propertyName, name] = getDeconflictedNameAndPropertyName(node.propertyName == null ? undefined : node.propertyName.text, node.name.text);

	markAsExported({
		name,
		propertyName,
		node,
		originalModule,
		rawModuleSpecifier,
		isExternal: rawModuleSpecifier != null && isExternalLibrary(rawModuleSpecifier),
		defaultExport: node.name.text === "default"
	});
	return undefined;
}
