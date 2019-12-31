import {TS} from "../../../../../../type/ts";
import {TrackExportsTransformerVisitorOptions} from "../track-exports-transformer-visitor-options";
import {getExportedSymbolFromExportSpecifier} from "../../../util/create-export-specifier-from-name-and-modifiers";

export function visitExportDeclaration({node, typescript, markAsExported}: TrackExportsTransformerVisitorOptions<TS.ExportDeclaration>): void {
	if (node.moduleSpecifier != null && !typescript.isStringLiteralLike(node.moduleSpecifier)) return;

	// If there is no ExportClause, it is a NamespaceExport such as 'export * from "..."'
	if (node.exportClause == null) {
		// It will never make sense to have a NamespaceExport with no ModuleSpecifier, but nevertheless do the check
		if (node.moduleSpecifier != null) {
			markAsExported({
				isNamespaceExport: true,
				moduleSpecifier: node.moduleSpecifier.text
			});
		}
		return;
	}

	// Otherwise, check all ExportSpecifiers
	for (const exportSpecifier of node.exportClause.elements) {
		markAsExported(getExportedSymbolFromExportSpecifier(exportSpecifier, node.moduleSpecifier?.text));
	}
}
