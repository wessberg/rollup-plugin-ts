import {ModuleDeclaration, updateModuleDeclaration} from "typescript";
import {UpdateExportsVisitorOptions} from "../update-exports-visitor-options";
import {ensureHasDeclareModifier, hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";
import {normalize} from "path";

/**
 * Visits the given ModuleDeclaration.
 * @param {UpdateExportsVisitorOptions<ModuleDeclaration>} options
 * @returns {ModuleDeclaration | undefined}
 */
export function visitModuleDeclaration({
	node,
	continuation,
	sourceFile,
	isEntry,
	exportedSpecifiersFromModule,
	parsedExportedSymbols,
	identifiersForDefaultExportsForModules,
	updatedIdentifierNamesForModuleMapReversed
}: UpdateExportsVisitorOptions<ModuleDeclaration>): ModuleDeclaration | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node)) return continuation(node);

	// If the node is located in the entry file, leave it as it is - completely
	if (isEntry) {
		if (!hasDefaultExportModifier(node.modifiers)) {
			// If the module name has been updated to avoid conflicts with other local symbols,
			// we'll have to remove the export modifier and add an ExportDeclaration later that exports the aliased identifier under the original name.
			// For example, if the module is called 'Foo' but has been deconflicted to 'Foo_$0', remove the export modifier and instead
			// generate and ExportDeclaration like 'export {Foo_$0 as Foo}'.
			const updatedIdentifierNames = updatedIdentifierNamesForModuleMapReversed.get(normalize(sourceFile.fileName));
			if (updatedIdentifierNames != null && updatedIdentifierNames.has(node.name.text)) {
				// Add the node name to the exported symbols
				parsedExportedSymbols.set(node.name.text, [updatedIdentifierNames.get(node.name.text), node]);

				return continuation(
					updateModuleDeclaration(node, node.decorators, ensureHasDeclareModifier(removeExportModifier(node.modifiers)), node.name, node.body)
				);
			} else {
				exportedSpecifiersFromModule.add(node.name.text);
			}
		}
		return continuation(node);
	}

	// If the node has a default export, mark it as the identifier for the default export of that module
	if (hasDefaultExportModifier(node.modifiers)) {
		identifiersForDefaultExportsForModules.set(normalize(sourceFile.fileName), [node.name.text, node]);
	} else {
		// Add the node name to the exported symbols
		parsedExportedSymbols.set(node.name.text, [undefined, node]);
	}

	// Update the node and remove the export modifiers from it
	return continuation(updateModuleDeclaration(node, node.decorators, removeExportModifier(node.modifiers), node.name, node.body));
}
