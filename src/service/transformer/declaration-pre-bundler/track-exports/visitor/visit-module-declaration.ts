import {ModuleDeclaration, updateModuleDeclaration} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";

/**
 * Visits the given ModuleDeclaration.
 * @param {TrackExportsVisitorOptions<ModuleDeclaration>} options
 * @returns {ModuleDeclaration | undefined}
 */
export function visitModuleDeclaration({
	node,
	sourceFile,
	markAsExported
}: TrackExportsVisitorOptions<ModuleDeclaration>): ModuleDeclaration | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node)) return node;

	markAsExported({
		node,
		defaultExport: hasDefaultExportModifier(node.modifiers),
		originalModule: sourceFile.fileName,
		name: node.name.text,
		propertyName: undefined
	});

	// Update the node and remove the export modifiers from it
	return updateModuleDeclaration(node, node.decorators, removeExportModifier(node.modifiers), node.name, node.body);
}
