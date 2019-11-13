import {TypeAliasDeclaration, updateTypeAliasDeclaration} from "typescript";
import {TrackExportsVisitorOptions} from "../track-exports-visitor-options";
import {hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";
import {normalize} from "path";

/**
 * Visits the given TypeAliasDeclaration.
 * @param {TrackExportsVisitorOptions<TypeAliasDeclaration>} options
 * @returns {TypeAliasDeclaration | undefined}
 */
export function visitTypeAliasDeclaration({
	node,
	sourceFile,
	markAsExported,
	getDeconflictedNameAndPropertyName
}: TrackExportsVisitorOptions<TypeAliasDeclaration>): TypeAliasDeclaration | undefined {
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
	return updateTypeAliasDeclaration(node, node.decorators, removeExportModifier(node.modifiers), node.name, node.typeParameters, node.type);
}
