import {ensureHasLeadingDotAndPosix} from "../../../../util/path/path-util";
import {TS} from "../../../../type/ts";

export type MergedExportDeclarationsMap = Map<string | undefined, TS.ExportDeclaration[]>;

/**
 * Merges the exports based on the given Statements
 */
export function getMergedExportDeclarationsForModules(sourceFile: TS.SourceFile, typescript: typeof TS): MergedExportDeclarationsMap {
	const exports = sourceFile.statements.filter(typescript.isExportDeclaration);
	const exportAssignments = sourceFile.statements.filter(typescript.isExportAssignment);

	const moduleToExportDeclarations: MergedExportDeclarationsMap = new Map();
	const moduleSpecifierToAliasedExportedBindings: Map<string | undefined, Map<string, Set<string>>> = new Map();
	const namedNamespaceExportsFromModulesMap: Map<string, Set<string>> = new Map();
	const reExportedSpecifiers = new Set<string | undefined>();

	for (const exportAssignment of exportAssignments) {
		let aliasedExportedBindings = moduleSpecifierToAliasedExportedBindings.get(undefined);

		if (aliasedExportedBindings == null) {
			aliasedExportedBindings = new Map();
			moduleSpecifierToAliasedExportedBindings.set(undefined, aliasedExportedBindings);
		}

		// If the Expression isn't an identifier, skip this ExportAssignment
		if (!typescript.isIdentifier(exportAssignment.expression)) {
			continue;
		}

		const propertyName = exportAssignment.expression.text;
		const alias = "default";
		let setForExportedBinding = aliasedExportedBindings.get(propertyName);
		if (setForExportedBinding == null) {
			setForExportedBinding = new Set();
			aliasedExportedBindings.set(propertyName, setForExportedBinding);
		}
		setForExportedBinding.add(alias);
	}

	for (const exportDeclaration of exports) {
		// If the ModuleSpecifier is given and it isn't a string literal, leave it as it is
		if (exportDeclaration.moduleSpecifier != null && !typescript.isStringLiteralLike(exportDeclaration.moduleSpecifier)) {
			continue;
		}

		const specifierText = exportDeclaration.moduleSpecifier?.text;

		let aliasedExportedBindings = moduleSpecifierToAliasedExportedBindings.get(specifierText);
		let namedNamespaceExports = specifierText == null ? undefined : namedNamespaceExportsFromModulesMap.get(specifierText);

		if (aliasedExportedBindings == null) {
			aliasedExportedBindings = new Map();
			moduleSpecifierToAliasedExportedBindings.set(specifierText, aliasedExportedBindings);
		}

		if (namedNamespaceExports == null && specifierText != null) {
			namedNamespaceExports = new Set();
			namedNamespaceExportsFromModulesMap.set(specifierText, namedNamespaceExports);
		}

		if (exportDeclaration.exportClause != null) {
			if (typescript.isNamedExports(exportDeclaration.exportClause)) {
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

			// Otherwise, it must be a named NamespaceExport (such as 'export * as Foo from "..."')
			else if (namedNamespaceExports != null) {
				namedNamespaceExports.add(exportDeclaration.exportClause.name.text);
			}
		}
		// If it has no exportClause, it's a reexport (such as export * from "./<specifier>").
		else {
			// Don't include the same clause twice
			if (reExportedSpecifiers.has(specifierText)) continue;
			reExportedSpecifiers.add(specifierText);

			let exportDeclarationsForModule = moduleToExportDeclarations.get(specifierText);
			if (exportDeclarationsForModule == null) {
				exportDeclarationsForModule = [];
				moduleToExportDeclarations.set(specifierText, exportDeclarationsForModule);
			}
			exportDeclarationsForModule.push(exportDeclaration);
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

		let exportDeclarationsForModule = moduleToExportDeclarations.get(specifier);
		if (exportDeclarationsForModule == null) {
			exportDeclarationsForModule = [];
			moduleToExportDeclarations.set(specifier, exportDeclarationsForModule);
		}
		exportDeclarationsForModule.push(
			typescript.createExportDeclaration(
				undefined,
				undefined,
				typescript.createNamedExports(exportSpecifiers),
				specifier == null ? undefined : typescript.createStringLiteral(ensureHasLeadingDotAndPosix(specifier))
			)
		);
	}

	// Add all named namespace exports from the module (They may have different local names)
	for (const [specifier, names] of namedNamespaceExportsFromModulesMap) {
		let exportDeclarationsForModule = moduleToExportDeclarations.get(specifier);
		if (exportDeclarationsForModule == null) {
			exportDeclarationsForModule = [];
			moduleToExportDeclarations.set(specifier, exportDeclarationsForModule);
		}

		for (const name of names) {
			exportDeclarationsForModule.push(
				typescript.createExportDeclaration(
					undefined,
					undefined,
					typescript.createNamespaceExport(typescript.createIdentifier(name)),
					typescript.createStringLiteral(ensureHasLeadingDotAndPosix(specifier))
				)
			);
		}
	}

	return moduleToExportDeclarations;
}
