import type {TS} from "../../../../../../type/ts.js";
import type {NoExportDeclarationTransformerVisitorOptions} from "../no-export-declaration-transformer-visitor-options.js";

export function visitExportDeclaration(options: NoExportDeclarationTransformerVisitorOptions<TS.ExportDeclaration>): TS.ExportDeclaration | undefined {
	const {node, typescript, preserveExportsWithModuleSpecifiers, preserveAliasedExports} = options;
	if (preserveExportsWithModuleSpecifiers && node.moduleSpecifier != null) {
		return node;
	}
	const isNamespaceExport = typescript.isNamespaceExport == null ? (_: TS.Node): _ is TS.NamespaceExport => false : typescript.isNamespaceExport;

	if (preserveAliasedExports && node.exportClause != null && (isNamespaceExport(node.exportClause) || node.exportClause.elements.some(element => element.propertyName != null))) {
		return node;
	}

	return undefined;
}
