import {TS} from "../../../../type/ts";
import {ExportedSymbol, ImportedSymbol} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";
import {hasDefaultExportModifier} from "./modifier-util";

export interface CreateExportSpecifierFromNameAndModifiersOptions {
	name: string;
	modifiers: TS.ModifiersArray | undefined;
	typescript: typeof TS;
}

export interface CreateExportSpecifierFromNameAndModifiersResult {
	exportSpecifier: TS.ExportSpecifier;
	exportedSymbol: ExportedSymbol;
}

export function getImportedSymbolFromImportSpecifier(specifier: TS.ImportSpecifier, moduleSpecifier: string): ImportedSymbol {
	return {
		moduleSpecifier,
		isDefaultImport: specifier.name.text === "default",
		propertyName: specifier.propertyName ?? specifier.name,
		name: specifier.name
	};
}

export function getImportedSymbolFromImportClauseName(clauseName: TS.Identifier, moduleSpecifier: string): ImportedSymbol {
	return {
		moduleSpecifier,
		isDefaultImport: true,
		propertyName: clauseName,
		name: clauseName
	};
}

export function getImportedSymbolFromNamespaceImport(namespaceImport: TS.NamespaceImport, moduleSpecifier: string): ImportedSymbol {
	return {
		moduleSpecifier,
		isDefaultImport: true,
		propertyName: namespaceImport.name,
		name: namespaceImport.name
	};
}

export function getExportedSymbolFromExportSpecifier(specifier: TS.ExportSpecifier, moduleSpecifier: string | undefined): ExportedSymbol {
	return {
		moduleSpecifier,
		isDefaultExport: specifier.name.text === "default",
		propertyName: specifier.propertyName ?? specifier.name,
		name: specifier.name
	};
}

export function createExportSpecifierFromNameAndModifiers({
	name,
	modifiers,
	typescript
}: CreateExportSpecifierFromNameAndModifiersOptions): CreateExportSpecifierFromNameAndModifiersResult {
	if (hasDefaultExportModifier(modifiers, typescript)) {
		const propertyNameText = name;
		const nameText = "default";
		const exportSpecifier = typescript.createExportSpecifier(
			propertyNameText === nameText ? undefined : typescript.createIdentifier(propertyNameText),
			typescript.createIdentifier(nameText)
		);

		return {
			exportSpecifier,
			exportedSymbol: getExportedSymbolFromExportSpecifier(exportSpecifier, undefined)
		};
	} else {
		const propertyNameText = name;
		const nameText = propertyNameText;
		const exportSpecifier = typescript.createExportSpecifier(
			propertyNameText === nameText ? undefined : typescript.createIdentifier(propertyNameText),
			typescript.createIdentifier(nameText)
		);

		return {
			exportSpecifier,
			exportedSymbol: getExportedSymbolFromExportSpecifier(exportSpecifier, undefined)
		};
	}
}
