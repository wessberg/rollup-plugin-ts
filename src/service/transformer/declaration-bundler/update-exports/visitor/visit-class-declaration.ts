import {ClassDeclaration, updateClassDeclaration, createIdentifier, Identifier} from "typescript";
import {UpdateExportsVisitorOptions} from "../update-exports-visitor-options";
import {ensureHasDeclareModifier, hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";
import {pascalCase} from "@wessberg/stringutil";
import {stripKnownExtension} from "../../../../../util/path/path-util";
import {basename, normalize} from "path";

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
	updatedIdentifierNamesForModuleMapReversed
}: UpdateExportsVisitorOptions<ClassDeclaration>): ClassDeclaration | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node)) return continuation(node);

	let name: Identifier | undefined = node.name;

	if (isEntry) {
		if (!hasDefaultExportModifier(node.modifiers) && name != null) {
			// If the class name has been updated to avoid conflicts with other local symbols,
			// we'll have to remove the export modifier and add an ExportDeclaration later that exports the aliased identifier under the original name.
			// For example, if the class is called 'Foo' but has been deconflicted to 'Foo_$0', remove the export modifier and instead
			// generate and ExportDeclaration like 'export {Foo_$0 as Foo}'.
			const updatedIdentifierNames = updatedIdentifierNamesForModuleMapReversed.get(normalize(sourceFile.fileName));
			if (updatedIdentifierNames != null && updatedIdentifierNames.has(name.text)) {
				// Add the node name to the exported symbols
				parsedExportedSymbols.set(name.text, [updatedIdentifierNames.get(name.text), node]);

				return continuation(
					updateClassDeclaration(
						node,
						node.decorators,
						ensureHasDeclareModifier(removeExportModifier(node.modifiers)),
						name,
						node.typeParameters,
						node.heritageClauses,
						node.members
					)
				);
			} else {
				exportedSpecifiersFromModule.add(name.text);
			}
		}
		return continuation(node);
	}

	// If the node has a default export, mark it as the identifier for the default export of that module
	if (hasDefaultExportModifier(node.modifiers)) {
		if (name == null) {
			name = createIdentifier(`Default${pascalCase(stripKnownExtension(basename(sourceFile.fileName)))}Export`);
		}
		// Compute a name for it. It must have one
		identifiersForDefaultExportsForModules.set(normalize(sourceFile.fileName), [name.text, node]);
	} else if (name != null) {
		// Add the node name to the exported symbols
		parsedExportedSymbols.set(name.text, [undefined, node]);
	}

	// Update the node and remove the export modifiers from it
	return continuation(
		updateClassDeclaration(
			node,
			node.decorators,
			ensureHasDeclareModifier(removeExportModifier(node.modifiers)),
			name,
			node.typeParameters,
			node.heritageClauses,
			node.members
		)
	);
}
