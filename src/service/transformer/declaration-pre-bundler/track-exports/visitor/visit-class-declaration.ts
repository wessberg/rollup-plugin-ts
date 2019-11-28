import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {ensureHasDeclareModifier, hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";
import {normalize} from "path";
import {TS} from "../../../../../type/ts";

/**
 * Visits the given ClassDeclaration.
 */
export function visitClassDeclaration({
	node,
	sourceFile,
	markAsExported,
	typescript
}: TrackExportsVisitorOptions<TS.ClassDeclaration>): TS.ClassDeclaration | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return node;

	markAsExported({
		name: node.name == null ? "default" : node.name.text,
		propertyName: undefined,
		node,
		originalModule: normalize(sourceFile.fileName),
		isExternal: false,
		rawModuleSpecifier: undefined,
		defaultExport: node.name == null || hasDefaultExportModifier(node.modifiers, typescript)
	});

	// Update the node and remove the export modifiers from it
	return typescript.updateClassDeclaration(
		node,
		node.decorators,
		ensureHasDeclareModifier(removeExportModifier(node.modifiers, typescript), typescript),
		node.name,
		node.typeParameters,
		node.heritageClauses,
		node.members
	);
}
