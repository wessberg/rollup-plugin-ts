import {TS} from "../../../../type/ts";
import {hasDefaultExportModifier} from "./modifier-util";
import {ExportedSymbol} from "../transformers/track-exports-transformer/track-exports-transformer-visitor-options";
import {ImportedSymbol} from "../transformers/track-imports-transformer/track-imports-transformer-visitor-options";
import {CompatFactory} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";

export interface CreateExportSpecifierFromNameAndModifiersOptions {
	name: string;
	modifiers: TS.ModifiersArray | undefined;
	typescript: typeof TS;
	compatFactory: CompatFactory;
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
	typescript,
	compatFactory
}: CreateExportSpecifierFromNameAndModifiersOptions): CreateExportSpecifierFromNameAndModifiersResult {
	if (hasDefaultExportModifier(modifiers, typescript)) {
		const propertyNameText = name;
		const nameText = "default";
		const exportSpecifier = compatFactory.createExportSpecifier(
			propertyNameText === nameText ? undefined : compatFactory.createIdentifier(propertyNameText),
			compatFactory.createIdentifier(nameText)
		);

		return {
			exportSpecifier,
			exportedSymbol: getExportedSymbolFromExportSpecifier(exportSpecifier, undefined)
		};
	} else {
		const propertyNameText = name;
		const nameText = propertyNameText;
		const exportSpecifier = compatFactory.createExportSpecifier(
			propertyNameText === nameText ? undefined : compatFactory.createIdentifier(propertyNameText),
			compatFactory.createIdentifier(nameText)
		);

		return {
			exportSpecifier,
			exportedSymbol: getExportedSymbolFromExportSpecifier(exportSpecifier, undefined)
		};
	}
}
