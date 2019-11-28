import {ensureHasLeadingDotAndPosix} from "../../../../../util/path/path-util";
import {TS} from "../../../../../type/ts";

const EMPTY_MODULE_SPECIFIER_TOKEN = "_#gen__empty__module__specifier";

/**
 * Merges the exports based on the given Statements
 */
export function mergeExports(statements: TS.Statement[], typescript: typeof TS): TS.Statement[] {
	const exports = statements.filter(typescript.isExportDeclaration);
	const otherStatements = statements.filter(statement => !typescript.isExportDeclaration(statement));
	const moduleSpecifierToExportedBindingsMap: Map<string, Set<string>> = new Map();
	const exportDeclarations: Set<TS.ExportDeclaration> = new Set();

	for (const exportDeclaration of exports) {
		// If the ModuleSpecifier is given and it isn't a string literal, leave it as it is
		if (exportDeclaration.moduleSpecifier != null && !typescript.isStringLiteralLike(exportDeclaration.moduleSpecifier)) {
			exportDeclarations.add(exportDeclaration);
			continue;
		}

		const specifierText = exportDeclaration.moduleSpecifier == null ? EMPTY_MODULE_SPECIFIER_TOKEN : exportDeclaration.moduleSpecifier.text;

		let exportedBindings = moduleSpecifierToExportedBindingsMap.get(specifierText);
		if (exportedBindings == null) {
			exportedBindings = new Set();
			moduleSpecifierToExportedBindingsMap.set(specifierText, exportedBindings);
		}

		if (exportDeclaration.exportClause != null) {
			const aliasedExportSpecifiers: Set<TS.ExportSpecifier> = new Set();

			// Take all aliased exports
			for (const element of exportDeclaration.exportClause.elements) {
				if (element.propertyName != null && element.name != null) {
					aliasedExportSpecifiers.add(element);
				} else {
					exportedBindings.add(element.name.text);
				}
			}

			// If at least 1 is aliased, generate an export containing only those
			if (aliasedExportSpecifiers.size > 0) {
				exportDeclarations.add(
					typescript.createExportDeclaration(
						undefined,
						undefined,
						typescript.createNamedExports([...aliasedExportSpecifiers]),
						exportDeclaration.moduleSpecifier
					)
				);
			}
		} else {
			exportDeclarations.add(exportDeclaration);
		}
	}

	for (const [specifier, exportedBindings] of moduleSpecifierToExportedBindingsMap) {
		if (exportedBindings.size === 0) continue;

		exportDeclarations.add(
			typescript.createExportDeclaration(
				undefined,
				undefined,
				typescript.createNamedExports([...exportedBindings].map(exportedBinding => typescript.createExportSpecifier(undefined, exportedBinding))),
				specifier === EMPTY_MODULE_SPECIFIER_TOKEN ? undefined : typescript.createStringLiteral(ensureHasLeadingDotAndPosix(specifier))
			)
		);
	}

	return [...otherStatements, ...exportDeclarations];
}
