import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {isExternalLibrary} from "../../../../../util/path/path-util";
import {normalize} from "path";
import {TS} from "../../../../../type/ts";

/**
 * Visits the given ExportSpecifier.
 */
export function visitExportSpecifier({
	node,
	sourceFile,
	resolver,
	markAsExported,
	getCurrentModuleSpecifier,
	typescript
}: TrackExportsVisitorOptions<TS.ExportSpecifier>): TS.ExportSpecifier | undefined {
	const moduleSpecifier = getCurrentModuleSpecifier();
	const originalModule = normalize(
		moduleSpecifier == null || !typescript.isStringLiteralLike(moduleSpecifier)
			? sourceFile.fileName
			: resolver(moduleSpecifier.text, sourceFile.fileName) ?? sourceFile.fileName
	);
	const rawModuleSpecifier = moduleSpecifier == null || !typescript.isStringLiteralLike(moduleSpecifier) ? undefined : moduleSpecifier.text;

	markAsExported({
		name: node.name.text,
		propertyName: node.propertyName?.text,
		node,
		originalModule,
		rawModuleSpecifier,
		isExternal: rawModuleSpecifier != null && isExternalLibrary(rawModuleSpecifier),
		defaultExport: node.name.text === "default"
	});
	return undefined;
}
