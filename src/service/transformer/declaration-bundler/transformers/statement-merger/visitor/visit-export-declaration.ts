import {TS} from "../../../../../../type/ts";
import {StatementMergerVisitorOptions} from "../statement-merger-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";

export function visitExportDeclaration(options: StatementMergerVisitorOptions<TS.ExportDeclaration>): TS.ExportDeclaration[] | TS.ExportDeclaration | undefined {
	const {node, typescript} = options;

	// If the ModuleSpecifier is given and it isn't a string literal, leave it as it is
	if (node.moduleSpecifier != null && !typescript.isStringLiteralLike(node.moduleSpecifier)) {
		return node;
	}

	// Otherwise, replace this ExportDeclaration with merged exports from the module
	const replacements = options.preserveExportedModuleIfNeeded(node.moduleSpecifier?.text);
	if (replacements == null || replacements.length === 0) return undefined;
	const [first, ...other] = replacements;

	let exportClause: TS.NamedExports | TS.NamespaceExport | undefined;

	if (first.exportClause != null && typescript.isNamedExports(first.exportClause)) {
		exportClause =
			node.exportClause != null && typescript.isNamedExports(node.exportClause)
				? typescript.updateNamedExports(node.exportClause, first.exportClause.elements)
				: typescript.createNamedExports(first.exportClause.elements);
	} else if (first.exportClause != null && typescript.isNamespaceExport?.(first.exportClause)) {
		exportClause =
			node.exportClause != null && typescript.isNamespaceExport?.(node.exportClause)
				? typescript.updateNamespaceExport(node.exportClause, typescript.createIdentifier(first.exportClause.name.text))
				: typescript.createNamespaceExport(typescript.createIdentifier(first.exportClause.name.text));
	}

	return [preserveMeta(typescript.updateExportDeclaration(node, node.decorators, node.modifiers, exportClause, node.moduleSpecifier, node.isTypeOnly), node, options), ...other];
}
