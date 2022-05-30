import {TS} from "../../../../../../type/ts.js";
import {TrackExportsTransformerVisitorOptions} from "../track-exports-transformer-visitor-options.js";
import {getExportedSymbolFromExportSpecifier} from "../../../util/create-export-specifier-from-name-and-modifiers.js";

export function visitExportDeclaration({node, typescript, markAsExported}: TrackExportsTransformerVisitorOptions<TS.ExportDeclaration>): void {
	if (node.moduleSpecifier != null && !typescript.isStringLiteralLike(node.moduleSpecifier)) return;

	// If there is no ExportClause, it is a NamespaceExport such as 'export * from "..."'.
	// If there is, and it is a NamespaceExport, it will be something like 'export * as Foo from "..."'
	if (node.exportClause == null || typescript.isNamespaceExport?.(node.exportClause)) {
		// It will never make sense to have a NamespaceExport with no ModuleSpecifier, but nevertheless do the check
		if (node.moduleSpecifier != null) {
			markAsExported({
				isNamespaceExport: true,
				name: node.exportClause == null ? undefined : node.exportClause.name,
				moduleSpecifier: node.moduleSpecifier.text
			});
		}
		return;
	}

	// Otherwise, check all ExportSpecifiers
	for (const exportSpecifier of (node.exportClause as TS.NamedExports).elements) {
		markAsExported(getExportedSymbolFromExportSpecifier(exportSpecifier, node.isTypeOnly, node.moduleSpecifier?.text));
	}
}
