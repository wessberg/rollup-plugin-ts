import {ensureHasLeadingDotAndPosix} from "../../../../../util/path/path-util";
import {TS} from "../../../../../type/ts";

const EMPTY_MODULE_SPECIFIER_TOKEN = "_#gen__empty__module__specifier";

/**
 * Merges the exports based on the given Statements
 */
export function mergeExports(statements: TS.Statement[], typescript: typeof TS): TS.Statement[] {
	const exports = statements.filter(typescript.isExportDeclaration);
	const otherStatements = statements.filter(statement => !typescript.isExportDeclaration(statement));
	const moduleSpecifierToAliasedExportedBindings: Map<string, Map<string, Set<string>>> = new Map();
	const exportDeclarations: Set<TS.ExportDeclaration> = new Set();
	const reExportedSpecifiers = new Set<string>();

	for (const exportDeclaration of exports) {
		// If the ModuleSpecifier is given and it isn't a string literal, leave it as it is
		if (exportDeclaration.moduleSpecifier != null && !typescript.isStringLiteralLike(exportDeclaration.moduleSpecifier)) {
			exportDeclarations.add(exportDeclaration);
			continue;
		}

		const specifierText = exportDeclaration.moduleSpecifier == null ? EMPTY_MODULE_SPECIFIER_TOKEN : exportDeclaration.moduleSpecifier.text;

		let aliasedExportedBindings = moduleSpecifierToAliasedExportedBindings.get(specifierText);

		if (aliasedExportedBindings == null) {
			aliasedExportedBindings = new Map();
			moduleSpecifierToAliasedExportedBindings.set(specifierText, aliasedExportedBindings);
		}

		if (exportDeclaration.exportClause != null) {
			// Take all aliased exports
			for (const element of exportDeclaration.exportClause.elements) {
				const propertyName = element.propertyName != null ? element.propertyName.text : element.name.text;
				const alias = element.name.text;
				let setForExportedBinding = aliasedExportedBindings.get(propertyName);
				if (setForExportedBinding == null) {
					setForExportedBinding = new Set();
					aliasedExportedBindings.set(propertyName, setForExportedBinding);
				}
				setForExportedBinding.add(alias);
			}
		}
		// If it has no exportClause, it's a reexport (such as export * from "./<specifier>").
		else {
			// Don't include the same clause twice
			if (reExportedSpecifiers.has(specifierText)) continue;
			reExportedSpecifiers.add(specifierText);
			exportDeclarations.add(exportDeclaration);
		}
	}

	for (const [specifier, exportedBindings] of moduleSpecifierToAliasedExportedBindings) {
		if (exportedBindings.size === 0) continue;

		const exportSpecifiers: TS.ExportSpecifier[] = [];
		const bindings = new Set<string>();

		for (const [propertyName, aliases] of exportedBindings) {
			for (const alias of aliases) {
				// If a binding, A, is exported already, it cannot be exported again.
				if (bindings.has(alias)) continue;
				bindings.add(alias);

				if (propertyName === alias) {
					exportSpecifiers.push(typescript.createExportSpecifier(undefined, alias));
				} else {
					exportSpecifiers.push(typescript.createExportSpecifier(propertyName, alias));
				}
			}
		}

		exportDeclarations.add(
			typescript.createExportDeclaration(
				undefined,
				undefined,
				typescript.createNamedExports(exportSpecifiers),
				specifier === EMPTY_MODULE_SPECIFIER_TOKEN ? undefined : typescript.createStringLiteral(ensureHasLeadingDotAndPosix(specifier))
			)
		);
	}

	return [...otherStatements, ...exportDeclarations];
}
