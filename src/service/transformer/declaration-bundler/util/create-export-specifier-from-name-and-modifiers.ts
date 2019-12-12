import {TS} from "../../../../type/ts";
import {LexicalEnvironment} from "../transformers/deconflicter/deconflicter-options";
import {getBindingFromLexicalEnvironment, getReverseBindingFromLexicalEnvironment} from "./get-binding-from-lexical-environment";
import {ExportedSymbol, ImportedSymbol} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";
import {getSymbolAtLocation, GetSymbolAtLocationOptions} from "./get-symbol-at-location";
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

export function getImportedSymbolFromImportSpecifier(
	specifier: TS.ImportSpecifier,
	moduleSpecifier: string,
	options: Omit<GetSymbolAtLocationOptions, "node">
): ImportedSymbol {
	return {
		symbol: getSymbolAtLocation({...options, node: specifier.propertyName ?? specifier.name}),
		moduleSpecifier,
		isDefaultImport: specifier.name.text === "default",
		propertyName: specifier.propertyName != null ? specifier.propertyName.text : specifier.name.text,
		name: specifier.name.text
	};
}

export function getImportedSymbolFromImportClauseName(
	clauseName: TS.Identifier,
	moduleSpecifier: string,
	options: Omit<GetSymbolAtLocationOptions, "node">
): ImportedSymbol {
	return {
		symbol: getSymbolAtLocation({...options, node: clauseName}),
		moduleSpecifier,
		isDefaultImport: true,
		propertyName: clauseName.text,
		name: clauseName.text
	};
}

export function getExportedSymbolFromExportSpecifier(
	specifier: TS.ExportSpecifier,
	moduleSpecifier: string | undefined,
	options: Omit<GetSymbolAtLocationOptions, "node">
): ExportedSymbol {
	return {
		symbol: getSymbolAtLocation({...options, node: specifier.propertyName ?? specifier.name}),
		moduleSpecifier,
		isDefaultExport: specifier.name.text === "default",
		propertyName: specifier.propertyName != null ? specifier.propertyName.text : specifier.name.text,
		name: specifier.name.text
	};
}

export function createExportSpecifierFromNameAndModifiers({
	name,
	lexicalEnvironment,
	modifiers,
	typescript,
	...options
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
			exportedSymbol: getExportedSymbolFromExportSpecifier(exportSpecifier, undefined, {...options, typescript})
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
			exportedSymbol: getExportedSymbolFromExportSpecifier(exportSpecifier, undefined, {...options, typescript})
		};
	}
}
