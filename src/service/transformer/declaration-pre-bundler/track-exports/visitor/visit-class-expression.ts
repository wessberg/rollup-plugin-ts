import {ClassExpression, updateClassExpression} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {ensureHasDeclareModifier, hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";

/**
 * Visits the given ClassExpression.
 * @param {TrackExportsVisitorOptions<ClassExpression>} options
 * @returns {ClassExpression | undefined}
 */
export function visitClassExpression({
	node,
	sourceFile,
	markAsExported,
	getDeconflictedNameAndPropertyName
}: TrackExportsVisitorOptions<ClassExpression>): ClassExpression | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node)) return node;

	const [propertyName, name] = getDeconflictedNameAndPropertyName(undefined, node.name == null ? "default" : node.name.text);

	markAsExported({
		name,
		propertyName,
		node,
		originalModule: sourceFile.fileName,
		isExternal: false,
		rawModuleSpecifier: undefined,
		defaultExport: node.name == null || hasDefaultExportModifier(node.modifiers)
	});

	// Update the node and remove the export modifiers from it
	return updateClassExpression(
		node,
		ensureHasDeclareModifier(removeExportModifier(node.modifiers)),
		node.name,
		node.typeParameters,
		node.heritageClauses,
		node.members
	);
}
