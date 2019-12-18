import {TS} from "../../../../../../type/ts";
import {TrackImportsTransformerVisitorOptions} from "../track-imports-transformer-visitor-options";
import {
	getImportedSymbolFromImportClauseName,
	getImportedSymbolFromImportSpecifier,
	getImportedSymbolFromNamespaceImport
} from "../../../../declaration-bundler/util/create-export-specifier-from-name-and-modifiers";

export function visitImportDeclaration({node, typescript, markAsImported}: TrackImportsTransformerVisitorOptions<TS.ImportDeclaration>): void {
	if (!typescript.isStringLiteralLike(node.moduleSpecifier)) return;
	if (node.importClause == null) return;

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
}
