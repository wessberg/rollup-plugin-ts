import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {ensureHasDeclareModifier, hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";
import {normalize} from "path";
import {TS} from "../../../../../type/ts";

/**
 * Visits the given EnumDeclaration.
 */
export function visitEnumDeclaration({
	node,
	sourceFile,
	markAsExported,
	typescript
}: TrackExportsVisitorOptions<TS.EnumDeclaration>): TS.EnumDeclaration | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return node;

	markAsExported({
		node,
		defaultExport: hasDefaultExportModifier(node.modifiers, typescript),
		originalModule: normalize(sourceFile.fileName),
		isExternal: false,
		rawModuleSpecifier: undefined,
		name: node.name.text,
		propertyName: undefined
	});

	// Update the node and remove the export modifiers from it
	return typescript.updateEnumDeclaration(
		node,
		node.decorators,
		ensureHasDeclareModifier(removeExportModifier(node.modifiers, typescript), typescript),
		node.name,
		node.members
	);
}
