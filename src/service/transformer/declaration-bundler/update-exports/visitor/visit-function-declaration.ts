import {FunctionDeclaration, updateFunctionDeclaration} from "typescript";
import {UpdateExportsVisitorOptions} from "../update-exports-visitor-options";
import {hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";

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

	// If the function is located in the entry file, leave it as it is - completely
	if (isEntry) {
		if (!hasDefaultExportModifier(node.modifiers) && node.name != null) {
			exportedSpecifiersFromModule.add(node.name.text);
		}
		return continuation(node);
	}

	// If the Function has a default export, mark it as the identifier for the default export of that module
	if (hasDefaultExportModifier(node.modifiers)) {
		identifiersForDefaultExportsForModules.set(sourceFile.fileName, [node.name!.text, node]);
	} else {
		// Add the function name to the exported symbols
		parsedExportedSymbols.set(node.name!.text, node);
	}

	// Update the function and remove the export modifiers from it
	return continuation(
		updateFunctionDeclaration(node, node.decorators, removeExportModifier(node.modifiers), node.asteriskToken, node.name, node.typeParameters, node.parameters, node.type, node.body)
	);
}
