import {FunctionDeclaration, updateFunctionDeclaration} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {ensureHasDeclareModifier, hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";
import {normalize} from "path";

/**
 * Visits the given FunctionDeclaration.
 * @param {TrackExportsVisitorOptions<FunctionDeclaration>} options
 * @returns {FunctionDeclaration | undefined}
 */
export function visitFunctionDeclaration({
	node,
	sourceFile,
	markAsExported,
	getDeconflictedNameAndPropertyName
}: TrackExportsVisitorOptions<FunctionDeclaration>): FunctionDeclaration | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node)) return node;
	const [propertyName, name] = getDeconflictedNameAndPropertyName(undefined, node.name == null ? "default" : node.name.text);

	markAsExported({
		name,
		propertyName,
		node,
		defaultExport: node.name == null || hasDefaultExportModifier(node.modifiers),
		originalModule: normalize(sourceFile.fileName),
		rawModuleSpecifier: undefined,
		isExternal: false
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
