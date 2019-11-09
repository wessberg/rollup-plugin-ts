import {
	createIdentifier,
	createImportClause,
	createImportDeclaration,
	createImportSpecifier,
	createNamedImports,
	createNamespaceImport,
	createStringLiteral,
	ImportDeclaration,
	isImportDeclaration,
	isNamespaceImport,
	isStringLiteralLike,
	Statement
} from "typescript";
import {ensureHasLeadingDotAndPosix} from "../../../../../util/path/path-util";

/**
 * Merges the exports based on the given Statements
 * @param {Statement[]} statements
 * @return {Statement[]}
 */
export function mergeImports(statements: Statement[]): Statement[] {
	const imports = statements.filter(isImportDeclaration);
	const otherStatements = statements.filter(statement => !isImportDeclaration(statement));

	const namedImportsFromModulesMap: Map<string, {propertyName: string; alias: string}[][]> = new Map();
	const bindingLessImportModules: Set<string> = new Set();
	const defaultImportsFromModulesMap: Map<string, Set<string>> = new Map();
	const namespaceImportsFromModulesMap: Map<string, Set<string>> = new Map();

	const importDeclarations: Set<ImportDeclaration> = new Set();

	for (const importDeclaration of imports) {
		// If the ModuleSpecifier is given and it isn't a string literal, leave it as it is
		if (!isStringLiteralLike(importDeclaration.moduleSpecifier)) {
			importDeclarations.add(importDeclaration);
			continue;
		}

		const specifierText = importDeclaration.moduleSpecifier.text;

		let namedImportsFromModules = namedImportsFromModulesMap.get(specifierText);
		if (namedImportsFromModules == null) {
			namedImportsFromModules = [[]];
			namedImportsFromModulesMap.set(specifierText, namedImportsFromModules);
		}

		const addAliasForNamedImport = (propertyName: string, alias: string) => {
			let collectionWithProperty = namedImportsFromModules!.find(records =>
				records.some(record => propertyName === record.propertyName && alias === record.alias)
			);
			if (collectionWithProperty != null) return;

			if (propertyName === alias) {
				// append the pair to the 0-indexed collection
				const [firstCollection] = namedImportsFromModules!;
				firstCollection.push({propertyName, alias});
			} else {
				// Create a new collection
				collectionWithProperty = [{propertyName, alias}];
				namedImportsFromModules!.push(collectionWithProperty);
			}
		};

		let defaultImportsFromModules = defaultImportsFromModulesMap.get(specifierText);
		if (defaultImportsFromModules == null) {
			defaultImportsFromModules = new Set();
			defaultImportsFromModulesMap.set(specifierText, defaultImportsFromModules);
		}

		let namespaceImportsFromModules = namespaceImportsFromModulesMap.get(specifierText);
		if (namespaceImportsFromModules == null) {
			namespaceImportsFromModules = new Set();
			namespaceImportsFromModulesMap.set(specifierText, namespaceImportsFromModules);
		}

		if (importDeclaration.importClause == null) {
			bindingLessImportModules.add(importDeclaration.moduleSpecifier.text);
		} else {
			if (importDeclaration.importClause.name != null) {
				defaultImportsFromModules.add(importDeclaration.importClause.name.text);
			}

			if (importDeclaration.importClause.namedBindings != null) {
				if (isNamespaceImport(importDeclaration.importClause.namedBindings)) {
					namespaceImportsFromModules.add(importDeclaration.importClause.namedBindings.name.text);
				} else {
					for (const element of importDeclaration.importClause.namedBindings.elements) {
						if (element.propertyName == null) {
							addAliasForNamedImport(element.name.text, element.name.text);
						} else {
							addAliasForNamedImport(element.propertyName.text, element.name.text);
						}
					}
				}
			}
		}
	}

	// All all binding-less imports in the very top
	for (const module of bindingLessImportModules) {
		importDeclarations.add(createImportDeclaration(undefined, undefined, undefined, createStringLiteral(module)));
	}

	// Add all default imports from the module (They may have different local names)
	for (const [module, names] of defaultImportsFromModulesMap) {
		for (const name of names) {
			importDeclarations.add(
				createImportDeclaration(undefined, undefined, createImportClause(createIdentifier(name), undefined), createStringLiteral(module))
			);
		}
	}

	// Add all namespace imports from the module (They may have different local names)
	for (const [module, names] of namespaceImportsFromModulesMap) {
		for (const name of names) {
			importDeclarations.add(
				createImportDeclaration(
					undefined,
					undefined,
					createImportClause(undefined, createNamespaceImport(createIdentifier(name))),
					createStringLiteral(module)
				)
			);
		}
	}

	// Add all named imports from the module (They may have different local names)
	for (const [module, collections] of namedImportsFromModulesMap) {
		for (const collection of collections) {
			// Don't add empty collections
			if (collection.length < 1) continue;

			importDeclarations.add(
				createImportDeclaration(
					undefined,
					undefined,
					createImportClause(
						undefined,
						createNamedImports(
							collection.map(record =>
								record.propertyName !== record.alias
									? createImportSpecifier(createIdentifier(record.propertyName), createIdentifier(record.alias))
									: createImportSpecifier(undefined, createIdentifier(record.alias))
							)
						)
					),
					createStringLiteral(ensureHasLeadingDotAndPosix(module))
				)
			);
		}
	}

	return [...importDeclarations, ...otherStatements];
}
