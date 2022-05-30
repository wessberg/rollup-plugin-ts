import {TS} from "../../../../../../type/ts.js";
import {NoExportDeclarationTransformerVisitorOptions} from "../no-export-declaration-transformer-visitor-options.js";

export function visitExportDeclaration(options: NoExportDeclarationTransformerVisitorOptions<TS.ExportDeclaration>): TS.ExportDeclaration | undefined {
	const {node, typescript, preserveExportsWithModuleSpecifiers, preserveAliasedExports} = options;
	if (preserveExportsWithModuleSpecifiers && node.moduleSpecifier != null) {
		return node;
	}
	const isNamespaceExport = typescript.isNamespaceExport == null ? () => false : typescript.isNamespaceExport;

	if (preserveAliasedExports && node.exportClause != null && (isNamespaceExport(node.exportClause) || node.exportClause.elements.some(element => element.propertyName != null))) {
		return node;
	}

	return undefined;
}
