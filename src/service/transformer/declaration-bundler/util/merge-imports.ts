import {ensureHasLeadingDotAndPosix} from "../../../../util/path/path-util";
import {TS} from "../../../../type/ts";

/**
 * Merges the exports based on the given Statements
 */
export function mergeImports(statements: TS.Statement[], typescript: typeof TS): TS.Statement[] {
	const imports = statements.filter(typescript.isImportDeclaration);
	const otherStatements = statements.filter(statement => !typescript.isImportDeclaration(statement));

	const namedImportsFromModulesMap: Map<string, {propertyName: string; alias: string}[][]> = new Map();
	const bindingLessImportModules: Set<string> = new Set();
	const defaultImportsFromModulesMap: Map<string, Set<string>> = new Map();
	const namespaceImportsFromModulesMap: Map<string, Set<string>> = new Map();

	const importDeclarations: Set<TS.ImportDeclaration> = new Set();

	for (const importDeclaration of imports) {
		// If the ModuleSpecifier is given and it isn't a string literal, leave it as it is
		if (!typescript.isStringLiteralLike(importDeclaration.moduleSpecifier)) {
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
				if (typescript.isNamespaceImport(importDeclaration.importClause.namedBindings)) {
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
		importDeclarations.add(typescript.createImportDeclaration(undefined, undefined, undefined, typescript.createStringLiteral(module)));
	}

	// Add all default imports from the module (They may have different local names)
	for (const [module, names] of defaultImportsFromModulesMap) {
		for (const name of names) {
			importDeclarations.add(
				typescript.createImportDeclaration(
					undefined,
					undefined,
					typescript.createImportClause(typescript.createIdentifier(name), undefined),
					typescript.createStringLiteral(module)
				)
			);
		}
	}

	// Add all namespace imports from the module (They may have different local names)
	for (const [module, names] of namespaceImportsFromModulesMap) {
		for (const name of names) {
			importDeclarations.add(
				typescript.createImportDeclaration(
					undefined,
					undefined,
					typescript.createImportClause(undefined, typescript.createNamespaceImport(typescript.createIdentifier(name))),
					typescript.createStringLiteral(module)
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
				typescript.createImportDeclaration(
					undefined,
					undefined,
					typescript.createImportClause(
						undefined,
						typescript.createNamedImports(
							collection.map(record =>
								record.propertyName !== record.alias
									? typescript.createImportSpecifier(typescript.createIdentifier(record.propertyName), typescript.createIdentifier(record.alias))
									: typescript.createImportSpecifier(undefined, typescript.createIdentifier(record.alias))
							)
						)
					),
					typescript.createStringLiteral(ensureHasLeadingDotAndPosix(module))
				)
			);
		}
	}

	return [...importDeclarations, ...otherStatements];
}
