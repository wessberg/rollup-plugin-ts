import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";
import {normalize} from "path";
import {TS} from "../../../../../type/ts";

/**
 * Visits the given ModuleDeclaration.
 */
export function visitModuleDeclaration({
	node,
	sourceFile,
	markAsExported,
	typescript
}: TrackExportsVisitorOptions<TS.ModuleDeclaration>): TS.ModuleDeclaration | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return node;

	markAsExported({
		name: node.name.text,
		propertyName: undefined,
		node,
		defaultExport: hasDefaultExportModifier(node.modifiers, typescript),
		originalModule: normalize(sourceFile.fileName),
		rawModuleSpecifier: undefined,
		isExternal: false
	});

	// Update the node and remove the export modifiers from it
	return typescript.updateModuleDeclaration(node, node.decorators, removeExportModifier(node.modifiers, typescript), node.name, node.body);
}
