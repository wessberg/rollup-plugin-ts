import {TS} from "../../../../../../type/ts";
import {NoExportDeclarationTransformerVisitorOptions} from "../no-export-declaration-transformer-visitor-options";

export function visitExportDeclaration(options: NoExportDeclarationTransformerVisitorOptions<TS.ExportDeclaration>): TS.ExportDeclaration|undefined {
	const {node, typescript, preserveExportsWithModuleSpecifiers, preserveAliasedExports} = options;
	if (preserveExportsWithModuleSpecifiers && node.moduleSpecifier != null) {
		return node;
	}

	if (preserveAliasedExports && node.exportClause != null && (typescript.isNamespaceExport(node.exportClause) || node.exportClause.elements.some(element => element.propertyName != null))) {
		return node;
	}

	return undefined;
}
