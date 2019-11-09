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
	markAsExported,
	getDeconflictedNameAndPropertyName
}: TrackExportsVisitorOptions<ModuleDeclaration>): ModuleDeclaration | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node)) return node;
	const [propertyName, name] = getDeconflictedNameAndPropertyName(undefined, node.name.text);

	markAsExported({
		name,
		propertyName,
		node,
		defaultExport: hasDefaultExportModifier(node.modifiers),
		originalModule: sourceFile.fileName,
		rawModuleSpecifier: undefined,
		isExternal: false
	});

	// Update the node and remove the export modifiers from it
	return updateModuleDeclaration(node, node.decorators, removeExportModifier(node.modifiers), node.name, node.body);
}
