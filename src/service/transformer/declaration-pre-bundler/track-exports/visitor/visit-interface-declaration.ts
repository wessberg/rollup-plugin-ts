import {InterfaceDeclaration, updateInterfaceDeclaration} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";

/**
 * Visits the given InterfaceDeclaration.
 * @param {TrackExportsVisitorOptions<InterfaceDeclaration>} options
 * @returns {InterfaceDeclaration | undefined}
 */
export function visitInterfaceDeclaration({
	node,
	sourceFile,
	markAsExported
}: TrackExportsVisitorOptions<InterfaceDeclaration>): InterfaceDeclaration | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node)) return node;

	markAsExported({
		node,
		defaultExport: hasDefaultExportModifier(node.modifiers),
		originalModule: sourceFile.fileName,
		rawModuleSpecifier: undefined,
		isExternal: false,
		name: node.name.text,
		propertyName: undefined
	});

	// Update the node and remove the export modifiers from it
	return updateInterfaceDeclaration(
		node,
		node.decorators,
		removeExportModifier(node.modifiers),
		node.name,
		node.typeParameters,
		node.heritageClauses,
		node.members
	);
}
