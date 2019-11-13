import {InterfaceDeclaration, updateInterfaceDeclaration} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";
import {normalize} from "path";

/**
 * Visits the given InterfaceDeclaration.
 * @param {TrackExportsVisitorOptions<InterfaceDeclaration>} options
 * @returns {InterfaceDeclaration | undefined}
 */
export function visitInterfaceDeclaration({
	node,
	sourceFile,
	markAsExported,
	getDeconflictedNameAndPropertyName
}: TrackExportsVisitorOptions<InterfaceDeclaration>): InterfaceDeclaration | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node)) return node;
	const [propertyName, name] = getDeconflictedNameAndPropertyName(undefined, node.name.text);

	markAsExported({
		name,
		propertyName,
		node,
		defaultExport: hasDefaultExportModifier(node.modifiers),
		originalModule: normalize(sourceFile.fileName),
		rawModuleSpecifier: undefined,
		isExternal: false
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
