import {createVariableDeclaration, isIdentifier, updateVariableDeclarationList, updateVariableStatement, VariableStatement} from "typescript";
import {UpdateExportsVisitorOptions} from "../update-exports-visitor-options";
import {ensureHasDeclareModifier, hasDefaultExportModifier, hasExportModifier, removeExportModifier} from "../../util/modifier/modifier-util";
import {getIdentifiersForBindingName} from "../../util/binding-name/get-identifiers-for-binding-name";
import {pascalCase} from "@wessberg/stringutil";
import {basename, normalize} from "path";
import {stripKnownExtension} from "../../../../../util/path/path-util";

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
	updatedIdentifierNamesForModuleMapReversed
}: UpdateExportsVisitorOptions<VariableStatement>): VariableStatement | undefined {
	if (isEntry && !hasDefaultExportModifier(node.modifiers) && hasExportModifier(node)) {
		let hasUpdatedDeclarations = false;

		for (const declaration of node.declarationList.declarations) {
			// Add all of the named bindings to the exported symbols
			for (const identifier of getIdentifiersForBindingName(declaration.name)) {
				// If the declaration name has been updated to avoid conflicts with other local symbols,
				// we'll have to remove the export modifier and add an ExportDeclaration later that exports the aliased identifier under the original name.
				// For example, if the declaration is called 'foo' but has been deconflicted to 'foo_$0', remove the export modifier and instead
				// generate and ExportDeclaration like 'export {foo_$0 as foo}'.
				const updatedIdentifierNames = updatedIdentifierNamesForModuleMapReversed.get(normalize(sourceFile.fileName));
				if (updatedIdentifierNames != null && updatedIdentifierNames.has(identifier)) {
					// Add the node name to the exported symbols
					parsedExportedSymbols.set(identifier, [updatedIdentifierNames.get(identifier), node]);
					hasUpdatedDeclarations = true;
				} else {
					exportedSpecifiersFromModule.add(identifier);
				}
			}
		}

		if (hasUpdatedDeclarations) {
			return continuation(updateVariableStatement(node, ensureHasDeclareModifier(removeExportModifier(node.modifiers)), node.declarationList));
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
			const name = `default${pascalCase(stripKnownExtension(basename(sourceFile.fileName)))}Export`;
			identifiersForDefaultExportsForModules.set(normalize(sourceFile.fileName), [name, declaration]);

			return continuation(
				updateVariableStatement(
					node,
					ensureHasDeclareModifier(removeExportModifier(node.modifiers)),
					updateVariableDeclarationList(node.declarationList, [createVariableDeclaration(name, declaration.type, declaration.initializer)])
				)
			);
		}
	}

	// Add all of the declaration names to the exported symbols
	for (const declaration of node.declarationList.declarations) {
		// Add all of the named bindings to the exported symbols
		for (const identifier of getIdentifiersForBindingName(declaration.name)) {
			parsedExportedSymbols.set(identifier, [undefined, node]);
		}
	}

	// Remove the export modifier
	return continuation(updateVariableStatement(node, ensureHasDeclareModifier(removeExportModifier(node.modifiers)), node.declarationList));
}
