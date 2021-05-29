import {TS} from "../../../../type/ts";
import {hasDefaultExportModifier} from "./modifier-util";
import {ExportedSymbol} from "../transformers/track-exports-transformer/track-exports-transformer-visitor-options";
import {ImportedSymbol} from "../transformers/track-imports-transformer/track-imports-transformer-visitor-options";

export interface CreateExportSpecifierFromNameAndModifiersOptions {
	name: string;
	modifiers: TS.ModifiersArray | undefined;
	typescript: typeof TS;
	factory: TS.NodeFactory;
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
	factory
}: CreateExportSpecifierFromNameAndModifiersOptions): CreateExportSpecifierFromNameAndModifiersResult {
	if (hasDefaultExportModifier(modifiers, typescript)) {
		const propertyNameText = name;
		const nameText = "default";
		const exportSpecifier = factory.createExportSpecifier(
			propertyNameText === nameText ? undefined : factory.createIdentifier(propertyNameText),
			factory.createIdentifier(nameText)
		);

		return {
			exportSpecifier,
			exportedSymbol: getExportedSymbolFromExportSpecifier(exportSpecifier, undefined)
		};
	} else {
		const propertyNameText = name;
		const nameText = propertyNameText;
		const exportSpecifier = factory.createExportSpecifier(
			propertyNameText === nameText ? undefined : factory.createIdentifier(propertyNameText),
			factory.createIdentifier(nameText)
		);

		return {
			exportSpecifier,
			exportedSymbol: getExportedSymbolFromExportSpecifier(exportSpecifier, undefined)
		};
	}
}
