import {ImportedSymbol} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";

export function findMatchingImportedSymbol(importedSymbol: ImportedSymbol, importedSymbols: Iterable<ImportedSymbol>): ImportedSymbol | undefined {
	for (const otherImportedSymbol of importedSymbols) {
		// They both need to point to the same moduleSpecifier
		if (importedSymbol.moduleSpecifier !== otherImportedSymbol.moduleSpecifier) continue;

		// If it is a NamespaceImport, a matching ImportedSymbol must have the same name
		if ("isNamespaceImport" in importedSymbol) {
			if ("isNamespaceImport" in otherImportedSymbol && importedSymbol.name === otherImportedSymbol.name) {
				return otherImportedSymbol;
			}
		}

		// Otherwise, their names, property names, and default import values must be equal
		else {
			if (
				"isDefaultImport" in otherImportedSymbol &&
				importedSymbol.isDefaultImport === otherImportedSymbol.isDefaultImport &&
				importedSymbol.name === otherImportedSymbol.name &&
				importedSymbol.propertyName === otherImportedSymbol.propertyName
			) {
				return otherImportedSymbol;
			}
		}
	}
	return undefined;
}
