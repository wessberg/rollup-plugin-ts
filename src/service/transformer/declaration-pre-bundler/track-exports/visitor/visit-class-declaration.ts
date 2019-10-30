import {ClassDeclaration, updateClassDeclaration} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {ensureHasDeclareModifier, hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";

/**
 * Visits the given ClassDeclaration.
 * @param {TrackExportsVisitorOptions<ClassDeclaration>} options
 * @returns {ClassDeclaration | undefined}
 */
export function visitClassDeclaration({
	node,
	sourceFile,
	markAsExported
}: TrackExportsVisitorOptions<ClassDeclaration>): ClassDeclaration | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node)) return node;

	markAsExported({
		node,
		originalModule: sourceFile.fileName,
		defaultExport: node.name == null || hasDefaultExportModifier(node.modifiers),
		name: node.name == null ? "default" : node.name.text,
		propertyName: undefined
	});

	// Update the node and remove the export modifiers from it
	return updateClassDeclaration(
		node,
		node.decorators,
		ensureHasDeclareModifier(removeExportModifier(node.modifiers)),
		node.name,
		node.typeParameters,
		node.heritageClauses,
		node.members
	);
}
