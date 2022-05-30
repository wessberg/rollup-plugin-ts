import {TS} from "../../../../../../type/ts.js";
import {StatementMergerVisitorOptions} from "../statement-merger-visitor-options.js";

export function visitImportDeclaration(options: StatementMergerVisitorOptions<TS.ImportDeclaration>): TS.ImportDeclaration[] | TS.ImportDeclaration | undefined {
	const {node, factory, typescript} = options;

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

	if (replacements == null || replacements.length === 0) return undefined;
	const [first, ...other] = replacements;

	// Again, don't include binding-less imports. This doesn't make sense inside ambient modules
	if (first == null || first.importClause == null) {
		return undefined;
	}

	// If there is neither a default name or a single named binding, don't preserve the import
	if (
		first.importClause.name == null &&
		(first.importClause.namedBindings == null || (!typescript.isNamespaceImport(first.importClause.namedBindings) && first.importClause.namedBindings.elements.length < 1))
	) {
		return other;
	}

	return [
		factory.updateImportDeclaration(
			node,
			node.decorators,
			node.modifiers,
			factory.updateImportClause(node.importClause, first.importClause.isTypeOnly, first.importClause.name, first.importClause.namedBindings),
			node.moduleSpecifier,
			node.assertClause
		),
		...other
	];
}
