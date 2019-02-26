import {
	createIdentifier,
	createModifier,
	createStringLiteral,
	createVariableDeclaration,
	createVariableDeclarationList,
	createVariableStatement,
	ImportDeclaration,
	isStringLiteralLike,
	NodeFlags,
	SyntaxKind,
	updateImportDeclaration,
	VariableStatement
} from "typescript";
import {normalizeModuleSpecifier} from "../../util/module-specifier/normalize-module-specifier";
import {UpdateExportsVisitorOptions} from "../update-exports-visitor-options";
import {dirname, join} from "path";
import {setExtension} from "../../../../../util/path/path-util";

/**
 * Visits the given ImportDeclaration.
 * @param {UpdateExportsVisitorOptions<ImportDeclaration>} options
 * @returns {VariableStatement | undefined}
 */
export function visitImportDeclaration({
	node,
	sourceFile,
	supportedExtensions,
	absoluteOutFileName,
	relativeOutFileName,
	chunkToOriginalFileMap,
	identifiersForDefaultExportsForModules
}: UpdateExportsVisitorOptions<ImportDeclaration>): ImportDeclaration | VariableStatement | undefined {
	const specifier = node.moduleSpecifier;
	if (specifier == null || !isStringLiteralLike(specifier)) return node;

	// Potentially rewrite the ModuleSpecifier text to refer to one of the generated chunk filenames (which may not be the same or named the same)
	const {isSameChunk, hasChanged, normalizedModuleSpecifier} = normalizeModuleSpecifier({
		supportedExtensions,
		specifier: specifier.text,
		sourceFile,
		chunkToOriginalFileMap,
		absoluteOutFileName,
		relativeOutFileName
	});

	// If it imports from the same chunk, don't include the import unless it includes a default export from another module in which case it should be written to a VariableStatement.
	if (isSameChunk) {
		// If it imports a default export from the same chunk, this will have been rewritten to a named export. Create a variable statement instead that aliases it
		if (node.importClause != null && node.importClause.name != null) {
			for (const extension of ["", ...supportedExtensions]) {
				const path = extension === "" ? join(dirname(sourceFile.fileName), specifier.text) : setExtension(join(dirname(sourceFile.fileName), specifier.text), extension);
				if (identifiersForDefaultExportsForModules.has(path)) {
					return createVariableStatement(
						[createModifier(SyntaxKind.DeclareKeyword)],
						createVariableDeclarationList([createVariableDeclaration(node.importClause.name.text, undefined, createIdentifier(identifiersForDefaultExportsForModules.get(path)!))], NodeFlags.Const)
					);
				}
			}
		}
		return undefined;
	}

	// Update the ModuleSpecifier to point to the updated chunk filename, unless it didn't change at all
	else {
		if (hasChanged) {
			return updateImportDeclaration(node, node.decorators, node.modifiers, node.importClause, createStringLiteral(normalizedModuleSpecifier));
		}

		// Otherwise, return the node as it was
		else {
			return node;
		}
	}
}
