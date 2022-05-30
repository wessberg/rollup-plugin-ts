import {TS} from "../../../../type/ts.js";
import {hasDefaultExportModifier} from "./modifier-util.js";
import {ExportedSymbol} from "../transformers/track-exports-transformer/track-exports-transformer-visitor-options.js";
import {ImportedSymbol} from "../transformers/track-imports-transformer/track-imports-transformer-visitor-options.js";

export interface CreateExportSpecifierFromNameAndModifiersOptions {
	isTypeOnly?: boolean;
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
		isNamespaceImport: true,
		propertyName: namespaceImport.name,
		name: namespaceImport.name
	};
}

export function getExportedSymbolFromExportSpecifier(specifier: TS.ExportSpecifier, parentIsTypeOnly?: boolean | undefined, moduleSpecifier?: string | undefined): ExportedSymbol {
	return {
		moduleSpecifier,
		isTypeOnly: specifier.isTypeOnly || Boolean(parentIsTypeOnly),
		isDefaultExport: specifier.name.text === "default",
		propertyName: specifier.propertyName ?? specifier.name,
		name: specifier.name
	};
}

export function createExportSpecifierFromNameAndModifiers({
	name,
	modifiers,
	typescript,
	factory,
	isTypeOnly = false
}: CreateExportSpecifierFromNameAndModifiersOptions): CreateExportSpecifierFromNameAndModifiersResult {
	if (hasDefaultExportModifier(modifiers, typescript)) {
		const propertyNameText = name;
		const nameText = "default";
		const exportSpecifier = factory.createExportSpecifier(
			isTypeOnly,
			propertyNameText === nameText ? undefined : factory.createIdentifier(propertyNameText),
			factory.createIdentifier(nameText)
		);

		return {
			exportSpecifier,
			exportedSymbol: getExportedSymbolFromExportSpecifier(exportSpecifier)
		};
	} else {
		const propertyNameText = name;
		const nameText = propertyNameText;
		const exportSpecifier = factory.createExportSpecifier(
			isTypeOnly,
			propertyNameText === nameText ? undefined : factory.createIdentifier(propertyNameText),
			factory.createIdentifier(nameText)
		);

		return {
			exportSpecifier,
			exportedSymbol: getExportedSymbolFromExportSpecifier(exportSpecifier)
		};
	}
}
