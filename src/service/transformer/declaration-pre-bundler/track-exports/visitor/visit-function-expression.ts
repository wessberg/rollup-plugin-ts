import {FunctionExpression, updateFunctionExpression} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {ensureHasDeclareModifier, hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";
import {normalize} from "path";

/**
 * Visits the given FunctionExpression.
 * @param {TrackExportsVisitorOptions<FunctionExpression>} options
 * @returns {FunctionExpression | undefined}
 */
export function visitFunctionExpression({
	node,
	sourceFile,
	markAsExported,
	getDeconflictedNameAndPropertyName
}: TrackExportsVisitorOptions<FunctionExpression>): FunctionExpression | undefined {
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
	return updateFunctionExpression(
		node,
		ensureHasDeclareModifier(removeExportModifier(node.modifiers)),
		node.asteriskToken,
		node.name,
		node.typeParameters,
		node.parameters,
		node.type,
		node.body
	);
}
