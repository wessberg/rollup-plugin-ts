import type {TS} from "../../../../../../type/ts.js";
import type {TrackImportsTransformerVisitorOptions} from "../track-imports-transformer-visitor-options.js";
import {
	getImportedSymbolFromImportClauseName,
	getImportedSymbolFromImportSpecifier,
	getImportedSymbolFromNamespaceImport
} from "../../../util/create-export-specifier-from-name-and-modifiers.js";

export function visitImportDeclaration({node, typescript, markAsImported}: TrackImportsTransformerVisitorOptions<TS.ImportDeclaration>): void {
	if (!typescript.isStringLiteralLike(node.moduleSpecifier)) return;

	if (node.importClause != null) {
		if (node.importClause.name != null) {
			markAsImported(getImportedSymbolFromImportClauseName(node.importClause.name, node.moduleSpecifier.text));
		}

		if (node.importClause.namedBindings != null) {
			if (typescript.isNamespaceImport(node.importClause.namedBindings)) {
				markAsImported(getImportedSymbolFromNamespaceImport(node.importClause.namedBindings, node.moduleSpecifier.text));
			} else {
				// Otherwise, check all ExportSpecifiers
				for (const importSpecifier of node.importClause.namedBindings.elements) {
					markAsImported(getImportedSymbolFromImportSpecifier(importSpecifier, node.moduleSpecifier.text));
				}
			}
		}
	} else {
		markAsImported({
			moduleSpecifier: node.moduleSpecifier.text,
			isClauseLessImport: true
		});
	}
}
