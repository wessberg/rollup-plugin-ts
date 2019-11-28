import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {ensureHasDeclareModifier, hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";
import {normalize} from "path";
import {TS} from "../../../../../type/ts";

/**
 * Visits the given FunctionDeclaration.
 */
export function visitFunctionDeclaration({
	node,
	sourceFile,
	markAsExported,
	typescript
}: TrackExportsVisitorOptions<TS.FunctionDeclaration>): TS.FunctionDeclaration | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node, typescript)) return node;

	markAsExported({
		name: node.name == null ? "default" : node.name.text,
		propertyName: undefined,
		node,
		defaultExport: node.name == null || hasDefaultExportModifier(node.modifiers, typescript),
		originalModule: normalize(sourceFile.fileName),
		rawModuleSpecifier: undefined,
		isExternal: false
	});

	// Update the function and remove the export modifiers from it
	return typescript.updateFunctionDeclaration(
		node,
		node.decorators,
		ensureHasDeclareModifier(removeExportModifier(node.modifiers, typescript), typescript),
		node.asteriskToken,
		node.name,
		node.typeParameters,
		node.parameters,
		node.type,
		node.body
	);
}
