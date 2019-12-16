import {TS} from "../../../../../../type/ts";
import {StatementMergerVisitorOptions} from "../statement-merger-visitor-options";

export function visitImportDeclaration(
	options: StatementMergerVisitorOptions<TS.ImportDeclaration>
): TS.ImportDeclaration[] | TS.ImportDeclaration | undefined {
	const {node, typescript} = options;

	// If the ModuleSpecifier is given and it isn't a string literal, leave it as it is
	if (!typescript.isStringLiteralLike(node.moduleSpecifier)) {
		return node;
	}

	// Don't include binding-less imports. This doesn't make sense inside ambient modules
	if (node.importClause == null) {
		return undefined;
	}

	// Otherwise, replace this ImportDeclaration with merged imports from the module
	const replacements = options.preserveImportedModuleIfNeeded(node.moduleSpecifier.text);

	if (replacements == null) return undefined;
	const [first, ...other] = replacements;

	return [
		typescript.updateImportDeclaration(
			node,
			node.decorators,
			node.modifiers,
			first.importClause == null
				? first.importClause
				: typescript.updateImportClause(node.importClause, first.importClause.name, first.importClause.namedBindings),
			node.moduleSpecifier
		),
		...other
	];
}
