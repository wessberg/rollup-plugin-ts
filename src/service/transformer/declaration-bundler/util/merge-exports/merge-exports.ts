import {
	createExportDeclaration,
	createExportSpecifier,
	createNamedExports,
	createStringLiteral,
	ExportDeclaration,
	ExportSpecifier,
	isExportDeclaration,
	isStringLiteralLike,
	Statement
} from "typescript";
import {ensureHasLeadingDotAndPosix} from "../../../../../util/path/path-util";

const EMPTY_MODULE_SPECIFIER_TOKEN = "_#gen__empty__module__specifier";

/**
 * Merges the exports based on the given Statements
 */
export function mergeExports(statements: Statement[]): Statement[] {
	const exports = statements.filter(isExportDeclaration);
	const otherStatements = statements.filter(statement => !isExportDeclaration(statement));
	const moduleSpecifierToExportedBindingsMap: Map<string, Set<string>> = new Map();
	const exportDeclarations: Set<ExportDeclaration> = new Set();
	const reExportedSpecifiers = new Set<string>();

	for (const exportDeclaration of exports) {
		// If the ModuleSpecifier is given and it isn't a string literal, leave it as it is
		if (exportDeclaration.moduleSpecifier != null && !isStringLiteralLike(exportDeclaration.moduleSpecifier)) {
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
			const aliasedExportSpecifiers: Set<ExportSpecifier> = new Set();

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
					createExportDeclaration(undefined, undefined, createNamedExports([...aliasedExportSpecifiers]), exportDeclaration.moduleSpecifier)
				);
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

	for (const [specifier, exportedBindings] of moduleSpecifierToExportedBindingsMap) {
		if (exportedBindings.size === 0) continue;

		exportDeclarations.add(
			createExportDeclaration(
				undefined,
				undefined,
				createNamedExports([...exportedBindings].map(exportedBinding => createExportSpecifier(undefined, exportedBinding))),
				specifier === EMPTY_MODULE_SPECIFIER_TOKEN ? undefined : createStringLiteral(ensureHasLeadingDotAndPosix(specifier))
			)
		);
	}

	return [...otherStatements, ...exportDeclarations];
}
