import {ExportDeclaration, isStringLiteralLike} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {isExternalLibrary} from "../../../../../util/path/path-util";

/**
 * Visits the given ExportDeclaration.
 * @param {TrackExportsVisitorOptions<ExportDeclaration>} options
 * @returns {ExportDeclaration | undefined}
 */
export function visitExportDeclaration({
	node,
	sourceFile,
	continuation,
	resolver,
	markAsExported,
	setCurrentModuleSpecifier
}: TrackExportsVisitorOptions<ExportDeclaration>): ExportDeclaration | undefined {
	setCurrentModuleSpecifier(node.moduleSpecifier);
	// If there is an export clause, this is something like 'export {...} [from "..."]'.
	// We'll let other visitors handle such cases.
	if (node.exportClause != null) {
		continuation(node.exportClause);

		// Leave out the export
		return undefined;
	}

	// Otherwise, this is a 'export * from "..."' export that we need to handle here
	else {
		const originalModule = node.moduleSpecifier == null || !isStringLiteralLike(node.moduleSpecifier)
			? sourceFile.fileName
			: resolver(node.moduleSpecifier.text, sourceFile.fileName) ?? sourceFile.fileName;

		const rawModuleSpecifier = node.moduleSpecifier == null || !isStringLiteralLike(node.moduleSpecifier) ? undefined : node.moduleSpecifier.text;

		markAsExported({
			node,
			originalModule,
			rawModuleSpecifier,
			isExternal: rawModuleSpecifier != null && isExternalLibrary(rawModuleSpecifier),
			defaultExport: false,
			namespaceExport: true,
			name: "*",
			propertyName: undefined
		});
		return undefined;
	}
}
