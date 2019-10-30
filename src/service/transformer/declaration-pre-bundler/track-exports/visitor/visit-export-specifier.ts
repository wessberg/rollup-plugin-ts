import {ExportSpecifier, isStringLiteralLike} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";

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

	markAsExported({
		node,
		originalModule:
			moduleSpecifier == null || !isStringLiteralLike(moduleSpecifier) ? sourceFile.fileName : resolver(moduleSpecifier.text, sourceFile.fileName),
		defaultExport: node.name.text === "default",
		name: node.name.text,
		propertyName: node.propertyName == null ? undefined : node.propertyName.text
	});
	return undefined;
}
