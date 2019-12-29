import {getAliasedDeclaration, GetAliasedDeclarationOptions} from "./get-aliased-declaration";
import {getTypeReferenceModuleFromFileName} from "./get-type-reference-module-from-file-name";
import {TS} from "../../../../type/ts";
import {isTypeScriptLib} from "../../../../util/path/path-util";

export interface GetTypeReferenceModuleFromNodeOptions extends GetAliasedDeclarationOptions {
	node: TS.Identifier;
	importDeclarations: TS.ImportDeclaration[];
}

export function getTypeReferenceModuleFromNode(options: GetTypeReferenceModuleFromNodeOptions): string | undefined {
	const aliasedDeclaration = getAliasedDeclaration(options);

	if (aliasedDeclaration == null) return;
	const declarationSourceFile = aliasedDeclaration.getSourceFile();
	if (declarationSourceFile == null) return;

	const typeReference = getTypeReferenceModuleFromFileName({...options, fileName: declarationSourceFile.fileName});
	if (typeReference == null) return undefined;

	// Otherwise, check if the particular binding is already directly imported somewhere, in which case the directive isn't needed
	for (const importDeclaration of options.importDeclarations) {
		// The module specifier must be identical to the name of the type reference
		if (!options.typescript.isStringLiteralLike(importDeclaration.moduleSpecifier)) continue;
		if (importDeclaration.moduleSpecifier.text !== typeReference) continue;

		// Otherwise, we only need to verify that the identifier is included as a binding inside the ImportClause
		if (importDeclaration.importClause == null) continue;

		// If the identifier is imported as a default import, we don't need the directive
		if (importDeclaration.importClause.name != null && importDeclaration.importClause.name.text === options.node.text) {
			return undefined;
		}

		// If there are no named bindings, there's no way the ImportClause may refer to the module of the type reference
		if (importDeclaration.importClause.namedBindings == null) continue;

		if (options.typescript.isNamespaceImport(importDeclaration.importClause.namedBindings)) {
			// If the identifier is imported as a namespace import, we don't need the directive
			if (importDeclaration.importClause.namedBindings.name.text === options.node.text) {
				return undefined;
			}
		} else {
			for (const importSpecifier of importDeclaration.importClause.namedBindings.elements) {
				// If the name of the ImportSpecifier is identical to that of the identifier, we don't need the directive
				if (importSpecifier.name.text === options.node.text) {
					return undefined;
				}
			}
		}
	}
	// Otherwise, the identifier may also be part of a built-in lib definition, in which case the type reference can be left out.
	// To find out, retrieve all implementations and check if any of them is a lib file
	try {
		const originalNode = options.nodeToOriginalNodeMap.get(options.node);
		const originalSourceFile = originalNode == null ? undefined : originalNode.getSourceFile();
		const implementations =
			options.node.end === -1 && originalSourceFile != null && originalNode != null
				? options.languageService.getImplementationAtPosition(originalSourceFile.fileName, originalNode.end)
				: options.languageService.getImplementationAtPosition(options.sourceFile.fileName, options.node.end);
		// If there are none, preserve it
		if (implementations == null) return typeReference;

		// If at least one of them comes from a built-in lib, we don't need the directive
		if (implementations.some(implementation => isTypeScriptLib(implementation.fileName))) {
			return undefined;
		}
	} catch {
		// This is OK
	}

	// Otherwise, preserve it!
	return typeReference;
}
