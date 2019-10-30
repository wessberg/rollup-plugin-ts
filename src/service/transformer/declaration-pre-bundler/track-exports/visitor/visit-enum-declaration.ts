import {EnumDeclaration, updateEnumDeclaration} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {ensureHasDeclareModifier, hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";

/**
 * Visits the given EnumDeclaration.
 * @param {TrackExportsVisitorOptions<EnumDeclaration>} options
 * @returns {EnumDeclaration | undefined}
 */
export function visitEnumDeclaration({
	node,

	sourceFile,
	markAsExported
}: TrackExportsVisitorOptions<EnumDeclaration>): EnumDeclaration | undefined {
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
	return updateEnumDeclaration(node, node.decorators, ensureHasDeclareModifier(removeExportModifier(node.modifiers)), node.name, node.members);
}
