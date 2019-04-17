import {EnumDeclaration, updateEnumDeclaration} from "typescript";
import {UpdateExportsVisitorOptions} from "../update-exports-visitor-options";
import {hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";

/**
 * Visits the given EnumDeclaration.
 * @param {UpdateExportsVisitorOptions<EnumDeclaration>} options
 * @returns {EnumDeclaration | undefined}
 */
export function visitEnumDeclaration({
	node,
	continuation,
	sourceFile,
	isEntry,
	exportedSpecifiersFromModule,
	parsedExportedSymbols,
	identifiersForDefaultExportsForModules
}: UpdateExportsVisitorOptions<EnumDeclaration>): EnumDeclaration | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node)) return continuation(node);

	// If the node is located in the entry file, leave it as it is - completely
	if (isEntry) {
		if (!hasDefaultExportModifier(node.modifiers)) {
			exportedSpecifiersFromModule.add(node.name.text);
		}
		return continuation(node);
	}

	// If the node has a default export, mark it as the identifier for the default export of that module
	if (hasDefaultExportModifier(node.modifiers)) {
		identifiersForDefaultExportsForModules.set(sourceFile.fileName, [node.name.text, node.kind]);
	} else {
		// Add the node name to the exported symbols
		parsedExportedSymbols.set(node.name.text, node);
	}

	// Update the node and remove the export modifiers from it
	return continuation(updateEnumDeclaration(node, node.decorators, removeExportModifier(node.modifiers), node.name, node.members));
}
