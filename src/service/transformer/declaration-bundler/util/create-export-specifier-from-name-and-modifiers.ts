import {TS} from "../../../../type/ts";
import {LexicalEnvironment} from "../transformers/deconflicter/deconflicter-options";
import {getBindingFromLexicalEnvironment, getReverseBindingFromLexicalEnvironment} from "./get-binding-from-lexical-environment";
import {ExportedSymbol, ImportedSymbol} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";
import {GetSymbolAtLocationOptions} from "./get-symbol-at-location";
import {hasDefaultExportModifier} from "./modifier-util";

export interface CreateExportSpecifierFromNameAndModifiersOptions extends Omit<GetSymbolAtLocationOptions, "node"> {
	name: string;
	modifiers: TS.ModifiersArray | undefined;
	lexicalEnvironment: LexicalEnvironment;
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
	lexicalEnvironment,
	modifiers,
	typescript
}: CreateExportSpecifierFromNameAndModifiersOptions): CreateExportSpecifierFromNameAndModifiersResult {
	if (hasDefaultExportModifier(modifiers, typescript)) {
		const propertyNameText = getBindingFromLexicalEnvironment(lexicalEnvironment, name) ?? name;
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
		const propertyNameText = getBindingFromLexicalEnvironment(lexicalEnvironment, name) ?? name;
		const nameText = getReverseBindingFromLexicalEnvironment(lexicalEnvironment, name) ?? propertyNameText;
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
