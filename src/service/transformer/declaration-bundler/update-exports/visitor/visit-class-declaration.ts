import {ClassDeclaration, updateClassDeclaration, createIdentifier, Identifier} from "typescript";
import {UpdateExportsVisitorOptions} from "../update-exports-visitor-options";
import {hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";
import {pascalCase} from "@wessberg/stringutil";
import {stripExtension} from "../../../../../util/path/path-util";
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
	identifiersForDefaultExportsForModules
}: UpdateExportsVisitorOptions<ClassDeclaration>): ClassDeclaration | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node)) return continuation(node);

	let name: Identifier | undefined = node.name;

	// If the node is located in the entry file, leave it as it is - completely
	if (isEntry) {
		if (!hasDefaultExportModifier(node.modifiers) && name != null) {
			exportedSpecifiersFromModule.add(name.text);
		}
		return continuation(node);
	}

	// If the node has a default export, mark it as the identifier for the default export of that module
	if (hasDefaultExportModifier(node.modifiers)) {
		if (name == null) {
			name = createIdentifier(`Default${pascalCase(stripExtension(basename(sourceFile.fileName)))}Export`);
		}
		// Compute a name for it. It must have one
		identifiersForDefaultExportsForModules.set(normalize(sourceFile.fileName), [name.text, node]);
	} else if (name != null) {
		// Add the node name to the exported symbols
		parsedExportedSymbols.set(name.text, node);
	}

	// Update the node and remove the export modifiers from it
	return continuation(
		updateClassDeclaration(node, node.decorators, removeExportModifier(node.modifiers), name, node.typeParameters, node.heritageClauses, node.members)
	);
}
