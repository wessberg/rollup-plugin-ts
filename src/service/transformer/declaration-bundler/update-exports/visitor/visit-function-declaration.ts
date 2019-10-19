import {createIdentifier, FunctionDeclaration, Identifier, updateFunctionDeclaration} from "typescript";
import {UpdateExportsVisitorOptions} from "../update-exports-visitor-options";
import {ensureHasDeclareModifier, hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";
import {pascalCase} from "@wessberg/stringutil";
import {stripKnownExtension} from "../../../../../util/path/path-util";
import {basename, normalize} from "path";

/**
 * Visits the given FunctionDeclaration.
 * @param {UpdateExportsVisitorOptions<FunctionDeclaration>} options
 * @returns {FunctionDeclaration | undefined}
 */
export function visitFunctionDeclaration({
	node,
	continuation,
	sourceFile,
	isEntry,
	exportedSpecifiersFromModule,
	parsedExportedSymbols,
	identifiersForDefaultExportsForModules
}: UpdateExportsVisitorOptions<FunctionDeclaration>): FunctionDeclaration | undefined {
	// If the node has no export modifier, leave it as it is
	if (!hasExportModifier(node)) return continuation(node);

	let name: Identifier | undefined = node.name;

	// If the function is located in the entry file, leave it as it is - completely
	if (isEntry) {
		if (!hasDefaultExportModifier(node.modifiers) && name != null) {
			exportedSpecifiersFromModule.add(name.text);
		}
		return continuation(node);
	}

	// If the Function has a default export, mark it as the identifier for the default export of that module
	if (hasDefaultExportModifier(node.modifiers)) {
		if (name == null) {
			name = createIdentifier(`default${pascalCase(stripKnownExtension(basename(sourceFile.fileName)))}Export`);
		}

		identifiersForDefaultExportsForModules.set(normalize(sourceFile.fileName), [name.text, node]);
	} else if (name != null) {
		// Add the function name to the exported symbols
		parsedExportedSymbols.set(name.text, node);
	}

	// Update the function and remove the export modifiers from it
	return continuation(
		updateFunctionDeclaration(
			node,
			node.decorators,
			ensureHasDeclareModifier(removeExportModifier(node.modifiers)),
			node.asteriskToken,
			name,
			node.typeParameters,
			node.parameters,
			node.type,
			node.body
		)
	);
}
