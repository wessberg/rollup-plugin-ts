import {TS} from "../../../../../../type/ts";
import {StatementMergerVisitorOptions} from "../statement-merger-visitor-options";

export function visitExportDeclaration(
	options: StatementMergerVisitorOptions<TS.ExportDeclaration>
): TS.ExportDeclaration[] | TS.ExportDeclaration | undefined {
	const {node, typescript} = options;

	// If the ModuleSpecifier is given and it isn't a string literal, leave it as it is
	if (node.moduleSpecifier != null && !typescript.isStringLiteralLike(node.moduleSpecifier)) {
		return node;
	}

	// Otherwise, replace this ExportDeclaration with merged exports from the module
	const replacements = options.preserveExportedModuleIfNeeded(node.moduleSpecifier?.text);
	if (replacements == null || replacements.length === 0) return undefined;
	const [first, ...other] = replacements;

	return [
		typescript.updateExportDeclaration(
			node,
			node.decorators,
			node.modifiers,
			node.exportClause == null || first.exportClause == null
				? first.exportClause
				: typescript.updateNamedExports(node.exportClause, first.exportClause.elements),
			node.moduleSpecifier,
			node.isTypeOnly
		),
		...other
	];
}
