import {ClassDeclaration, updateClassDeclaration} from "typescript";
import {UpdateExportsVisitorOptions} from "../update-exports-visitor-options";
import {hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";

/**
 * Visits the given ClassDeclaration.
 * @param {UpdateExportsVisitorOptions<ClassDeclaration>} options
 * @returns {ClassDeclaration | undefined}
 */
export function visitClassDeclaration({
	node,
	continuation,
	sourceFile,
	isEntry,
	exportedSpecifiersFromModule,
	parsedExportedSymbols,
	identifiersForDefaultExportsForModules,
	rootLevelIdentifiersForModule
}: UpdateExportsVisitorOptions<ClassDeclaration>): ClassDeclaration | undefined {
	if (node.name != null) {
		rootLevelIdentifiersForModule.add(node.name.text);
	}

	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node)) return continuation(node);

	// If the node is located in the entry file, leave it as it is - completely
	if (isEntry) {
		if (!hasDefaultExportModifier(node.modifiers)) {
			exportedSpecifiersFromModule.add(node.name!.text);
		}
		return continuation(node);
	}

	// If the node has a default export, mark it as the identifier for the default export of that module
	if (hasDefaultExportModifier(node.modifiers)) {
		identifiersForDefaultExportsForModules.set(sourceFile.fileName, node.name!.text);
	} else {
		// Add the node name to the exported symbols
		parsedExportedSymbols.add(node.name!.text);
	}

	// Update the node and remove the export modifiers from it
	return continuation(updateClassDeclaration(node, node.decorators, removeExportModifier(node.modifiers), node.name, node.typeParameters, node.heritageClauses, node.members));
}
