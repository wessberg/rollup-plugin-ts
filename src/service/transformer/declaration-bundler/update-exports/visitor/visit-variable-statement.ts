import {createVariableDeclaration, isIdentifier, updateVariableDeclarationList, updateVariableStatement, VariableStatement} from "typescript";
import {UpdateExportsVisitorOptions} from "../update-exports-visitor-options";
import {hasDefaultExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";
import {getIdentifiersForBindingName} from "../../util/binding-name/get-identifiers-for-binding-name";

/**
 * Visits the given VariableStatement.
 * @param {UpdateExportsVisitorOptions<VariableStatement>} options
 * @returns {VariableStatement | undefined}
 */
export function visitVariableStatement({
	node,
	continuation,
	sourceFile,
	isEntry,
	identifiersForDefaultExportsForModules,
	parsedExportedSymbols,
	exportedSpecifiersFromModule,
	generateUniqueVariableName,
	rootLevelIdentifiersForModule
}: UpdateExportsVisitorOptions<VariableStatement>): VariableStatement | undefined {
	for (const declaration of node.declarationList.declarations) {
		// Add all of the named bindings to the exported symbols
		for (const identifier of getIdentifiersForBindingName(declaration.name)) {
			if (isEntry && !hasDefaultExportModifier(node.modifiers)) {
				exportedSpecifiersFromModule.add(identifier);
			}

			rootLevelIdentifiersForModule.add(identifier);
		}
	}

	// Preserve the node if it is part of the entry file for the chunk
	// If the function is located in the entry file, leave it as it is - completely
	if (isEntry) {
		return continuation(node);
	}

	if (node.declarationList.declarations.length === 1) {
		const [declaration] = node.declarationList.declarations;

		// If the name of the declaration is '_default', it is an assignment to a const before exporting it as default
		if (isIdentifier(declaration.name) && declaration.name.text === "_default") {
			// Give it a unique variable name and bind it to a new variable
			const name = generateUniqueVariableName(declaration.name.text);
			identifiersForDefaultExportsForModules.set(sourceFile.fileName, name);

			return continuation(
				updateVariableStatement(
					node,
					removeExportModifier(node.modifiers),
					updateVariableDeclarationList(node.declarationList, [createVariableDeclaration(name, declaration.type, declaration.initializer)])
				)
			);
		}
	}

	// Add all of the declaration names to the exported symbols
	for (const declaration of node.declarationList.declarations) {
		// Add all of the named bindings to the exported symbols
		for (const identifier of getIdentifiersForBindingName(declaration.name)) {
			parsedExportedSymbols.add(identifier);
		}
	}

	// Remove the export modifier
	return continuation(updateVariableStatement(node, removeExportModifier(node.modifiers), node.declarationList));
}
