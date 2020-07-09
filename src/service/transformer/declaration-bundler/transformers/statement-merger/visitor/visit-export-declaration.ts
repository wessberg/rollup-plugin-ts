import {TS} from "../../../../../../type/ts";
import {StatementMergerVisitorOptions} from "../statement-merger-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {isNodeFactory} from "../../../util/is-node-factory";

export function visitExportDeclaration(options: StatementMergerVisitorOptions<TS.ExportDeclaration>): TS.ExportDeclaration[] | TS.ExportDeclaration | undefined {
	const {node, compatFactory, typescript} = options;

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
				? compatFactory.updateNamedExports(node.exportClause, first.exportClause.elements)
				: compatFactory.createNamedExports(first.exportClause.elements);
	} else if (first.exportClause != null && typescript.isNamespaceExport?.(first.exportClause)) {
		exportClause =
			node.exportClause != null && typescript.isNamespaceExport?.(node.exportClause)
				? compatFactory.updateNamespaceExport(node.exportClause, compatFactory.createIdentifier(first.exportClause.name.text))
				: compatFactory.createNamespaceExport(compatFactory.createIdentifier(first.exportClause.name.text));
	}

	return [
		preserveMeta(
			isNodeFactory(compatFactory)
				? compatFactory.updateExportDeclaration(node, node.decorators, node.modifiers, node.isTypeOnly, exportClause, node.moduleSpecifier)
				: compatFactory.updateExportDeclaration(node, node.decorators, node.modifiers, exportClause, node.moduleSpecifier, node.isTypeOnly),
			node,
			options
		),
		...other
	];
}
