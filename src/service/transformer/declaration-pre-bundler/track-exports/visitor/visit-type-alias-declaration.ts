import {TypeAliasDeclaration, updateTypeAliasDeclaration} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";

/**
 * Visits the given TypeAliasDeclaration.
 * @param {TrackExportsVisitorOptions<TypeAliasDeclaration>} options
 * @returns {TypeAliasDeclaration | undefined}
 */
export function visitTypeAliasDeclaration({
	node,
	sourceFile,
	markAsExported
}: TrackExportsVisitorOptions<TypeAliasDeclaration>): TypeAliasDeclaration | undefined {
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
	return updateTypeAliasDeclaration(node, node.decorators, removeExportModifier(node.modifiers), node.name, node.typeParameters, node.type);
}
