import {FunctionDeclaration, updateFunctionDeclaration} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {ensureHasDeclareModifier, hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";

/**
 * Visits the given FunctionDeclaration.
 * @param {TrackExportsVisitorOptions<FunctionDeclaration>} options
 * @returns {FunctionDeclaration | undefined}
 */
export function visitFunctionDeclaration({
	node,
	sourceFile,
	markAsExported
}: TrackExportsVisitorOptions<FunctionDeclaration>): FunctionDeclaration | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node)) return node;

	markAsExported({
		node,
		defaultExport: node.name == null || hasDefaultExportModifier(node.modifiers),
		originalModule: sourceFile.fileName,
		name: node.name == null ? "default" : node.name.text,
		propertyName: undefined
	});

	// Update the function and remove the export modifiers from it
	return updateFunctionDeclaration(
		node,
		node.decorators,
		ensureHasDeclareModifier(removeExportModifier(node.modifiers)),
		node.asteriskToken,
		node.name,
		node.typeParameters,
		node.parameters,
		node.type,
		node.body
	);
}
