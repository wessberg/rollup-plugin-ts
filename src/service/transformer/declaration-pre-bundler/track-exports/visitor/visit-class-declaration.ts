import {ClassDeclaration, updateClassDeclaration} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {ensureHasDeclareModifier, hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";
import {normalize} from "path";

/**
 * Visits the given ClassDeclaration.
 * @param {TrackExportsVisitorOptions<ClassDeclaration>} options
 * @returns {ClassDeclaration | undefined}
 */
export function visitClassDeclaration({
	node,
	sourceFile,
	markAsExported,
	getDeconflictedNameAndPropertyName
}: TrackExportsVisitorOptions<ClassDeclaration>): ClassDeclaration | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node)) return node;

	const [propertyName, name] = getDeconflictedNameAndPropertyName(undefined, node.name == null ? "default" : node.name.text);

	markAsExported({
		name,
		propertyName,
		node,
		originalModule: normalize(sourceFile.fileName),
		isExternal: false,
		rawModuleSpecifier: undefined,
		defaultExport: node.name == null || hasDefaultExportModifier(node.modifiers)
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
