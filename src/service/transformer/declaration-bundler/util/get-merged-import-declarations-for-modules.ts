import {ensureHasLeadingDotAndPosix} from "../../../../util/path/path-util";
import {TS} from "../../../../type/ts";
import {preserveParents} from "./clone-node-with-meta";
import {CompatFactory} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";
import {isNodeFactory} from "./is-node-factory";

export type MergedImportDeclarationsMap = Map<string, TS.ImportDeclaration[]>;

export function getMergedImportDeclarationsForModules(sourceFile: TS.SourceFile, compatFactory: CompatFactory, typescript: typeof TS): MergedImportDeclarationsMap {
	const imports = sourceFile.statements.filter(typescript.isImportDeclaration);

	const moduleToImportDeclarations: MergedImportDeclarationsMap = new Map();
	const namedImportsFromModulesMap: Map<string, {propertyName: string; alias: string}[][]> = new Map();
	const defaultImportsFromModulesMap: Map<string, Set<string>> = new Map();
	const namespaceImportsFromModulesMap: Map<string, Set<string>> = new Map();

	for (const importDeclaration of imports) {
		// If the ModuleSpecifier is given and it isn't a string literal, skip it
		if (!typescript.isStringLiteralLike(importDeclaration.moduleSpecifier)) {
			continue;
		}

		const specifierText = importDeclaration.moduleSpecifier.text;

		let namedImportsFromModules = namedImportsFromModulesMap.get(specifierText);
		if (namedImportsFromModules == null) {
			namedImportsFromModules = [[]];
			namedImportsFromModulesMap.set(specifierText, namedImportsFromModules);
		}

		const addAliasForNamedImport = (propertyName: string, alias: string) => {
			let collectionWithProperty = namedImportsFromModules!.find(records => records.some(record => propertyName === record.propertyName && alias === record.alias));
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

		if (importDeclaration.importClause != null) {
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

	// Add all default imports from the module (They may have different local names)
	for (const [module, names] of defaultImportsFromModulesMap) {
		let importDeclarationsForModule = moduleToImportDeclarations.get(module);
		if (importDeclarationsForModule == null) {
			importDeclarationsForModule = [];
			moduleToImportDeclarations.set(module, importDeclarationsForModule);
		}

		for (const name of names) {
			importDeclarationsForModule.push(
				preserveParents(
					compatFactory.createImportDeclaration(
						undefined,
						undefined,
						isNodeFactory(compatFactory)
							? compatFactory.createImportClause(false, compatFactory.createIdentifier(name), undefined)
							: compatFactory.createImportClause(compatFactory.createIdentifier(name), undefined, false),
						compatFactory.createStringLiteral(ensureHasLeadingDotAndPosix(module))
					),
					{typescript}
				)
			);
		}
	}

	// Add all namespace imports from the module (They may have different local names)
	for (const [module, names] of namespaceImportsFromModulesMap) {
		let importDeclarationsForModule = moduleToImportDeclarations.get(module);
		if (importDeclarationsForModule == null) {
			importDeclarationsForModule = [];
			moduleToImportDeclarations.set(module, importDeclarationsForModule);
		}

		for (const name of names) {
			importDeclarationsForModule.push(
				preserveParents(
					compatFactory.createImportDeclaration(
						undefined,
						undefined,
						isNodeFactory(compatFactory)
							? compatFactory.createImportClause(false, undefined, compatFactory.createNamespaceImport(compatFactory.createIdentifier(name)))
							: compatFactory.createImportClause(undefined, compatFactory.createNamespaceImport(compatFactory.createIdentifier(name)), false),
						compatFactory.createStringLiteral(ensureHasLeadingDotAndPosix(module))
					),
					{typescript}
				)
			);
		}
	}

	// Add all named imports from the module (They may have different local names)
	for (const [module, collections] of namedImportsFromModulesMap) {
		let importDeclarationsForModule = moduleToImportDeclarations.get(module);
		if (importDeclarationsForModule == null) {
			importDeclarationsForModule = [];
			moduleToImportDeclarations.set(module, importDeclarationsForModule);
		}

		for (const collection of collections) {
			// Don't add empty collections
			if (collection.length < 1) continue;

			importDeclarationsForModule.push(
				preserveParents(
					compatFactory.createImportDeclaration(
						undefined,
						undefined,
						isNodeFactory(compatFactory)
							? compatFactory.createImportClause(
									false,
									undefined,
									compatFactory.createNamedImports(
										collection.map(record =>
											record.propertyName !== record.alias
												? compatFactory.createImportSpecifier(compatFactory.createIdentifier(record.propertyName), compatFactory.createIdentifier(record.alias))
												: compatFactory.createImportSpecifier(undefined, compatFactory.createIdentifier(record.alias))
										)
									)
							  )
							: compatFactory.createImportClause(
									undefined,
									compatFactory.createNamedImports(
										collection.map(record =>
											record.propertyName !== record.alias
												? compatFactory.createImportSpecifier(compatFactory.createIdentifier(record.propertyName), compatFactory.createIdentifier(record.alias))
												: compatFactory.createImportSpecifier(undefined, compatFactory.createIdentifier(record.alias))
										)
									),
									false
							  ),
						compatFactory.createStringLiteral(ensureHasLeadingDotAndPosix(module))
					),
					{typescript}
				)
			);
		}
	}

	return moduleToImportDeclarations;
}
