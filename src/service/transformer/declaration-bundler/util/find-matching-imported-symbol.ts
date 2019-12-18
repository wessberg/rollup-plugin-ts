import {ImportedSymbol} from "../../cross-chunk-reference-tracker/transformers/track-imports-transformer/track-imports-transformer-visitor-options";

export function findMatchingImportedSymbol(importedSymbol: ImportedSymbol, importedSymbols: Iterable<ImportedSymbol>): ImportedSymbol | undefined {
	for (const otherImportedSymbol of importedSymbols) {
		// They both need to point to the same moduleSpecifier
		if (importedSymbol.moduleSpecifier !== otherImportedSymbol.moduleSpecifier) continue;

		// If it is a NamespaceImport, a matching ImportedSymbol must have the same name
		if ("isNamespaceImport" in importedSymbol) {
			if ("isNamespaceImport" in otherImportedSymbol && importedSymbol.name.text === otherImportedSymbol.name.text) {
				return otherImportedSymbol;
			}
		} else if ("isClauseLessImport" in importedSymbol) {
			if ("isClauseLessImport" in otherImportedSymbol) {
				return otherImportedSymbol;
			}
		}

		// Otherwise, their names, property names, and default import values must be equal
		else {
			if (
				"isDefaultImport" in otherImportedSymbol &&
				importedSymbol.isDefaultImport === otherImportedSymbol.isDefaultImport &&
				importedSymbol.name.text === otherImportedSymbol.name.text &&
				importedSymbol.propertyName.text === otherImportedSymbol.propertyName.text
			) {
				return otherImportedSymbol;
			}
		}
	}
	return undefined;
}
