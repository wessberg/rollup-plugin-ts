import type {GetAliasedDeclarationOptions} from "./get-aliased-declaration.js";
import {getAliasedDeclaration} from "./get-aliased-declaration.js";
import type {TypeReference} from "./get-type-reference-module-from-file-name.js";
import {getTypeReferenceModuleFromFileName} from "./get-type-reference-module-from-file-name.js";
import type {TS} from "../../../../type/ts.js";

export interface GetTypeReferenceModuleFromNodeOptions extends GetAliasedDeclarationOptions {
	node: TS.Identifier;
	importDeclarations: TS.ImportDeclaration[];
}

export function getTypeReferenceModuleFromNode(options: GetTypeReferenceModuleFromNodeOptions): TypeReference | undefined {
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
		if (importDeclaration.moduleSpecifier.text !== typeReference.moduleSpecifier) continue;

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

	// Otherwise, preserve it!
	return typeReference;
}
