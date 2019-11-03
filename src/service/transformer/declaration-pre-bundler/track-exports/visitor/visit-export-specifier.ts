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
	markAsExported
}: TrackExportsVisitorOptions<ExportSpecifier>): ExportSpecifier | undefined {
	const moduleSpecifier = node.parent == null || node.parent.parent == null ? undefined : node.parent.parent.moduleSpecifier;
	const originalModule = moduleSpecifier == null || !isStringLiteralLike(moduleSpecifier) ? sourceFile.fileName : resolver(moduleSpecifier.text, sourceFile.fileName) ?? sourceFile.fileName;
	const rawModuleSpecifier = moduleSpecifier == null || !isStringLiteralLike(moduleSpecifier) ? undefined : moduleSpecifier.text;

	markAsExported({
		node,
		originalModule,
		rawModuleSpecifier,
		isExternal: rawModuleSpecifier != null && isExternalLibrary(rawModuleSpecifier),
		defaultExport: node.name.text === "default",
		name: node.name.text,
		propertyName: node.propertyName == null ? undefined : node.propertyName.text
	});
	return undefined;
}
