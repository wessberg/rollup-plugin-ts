import {TS} from "../../../../../type/ts";
import {DeclarationBundlerOptions} from "../../declaration-bundler-options";
import {LexicalEnvironment} from "../deconflicter/deconflicter-options";

export interface ImportedSymbolBase {
	symbol: TS.Symbol | undefined;
	moduleSpecifier: string;
	name: string;
}

export interface NamedImportedSymbol extends ImportedSymbolBase {
	isDefaultImport: boolean;
	propertyName: string;
}

export interface NamespaceImportedSymbol extends ImportedSymbolBase {
	isNamespaceImport: true;
}

export type ImportedSymbol = NamedImportedSymbol | NamespaceImportedSymbol;

export interface ExportedSymbolBase {
	symbol: TS.Symbol | undefined;
}

export interface NamedExportedSymbol extends ExportedSymbolBase {
	// The raw module specifier with no modifications
	moduleSpecifier: string | undefined;
	isDefaultExport: boolean;
	name: string;
	propertyName: string;
}

export interface NamespaceExportedSymbol extends ExportedSymbolBase {
	// The raw module specifier with no modifications
	moduleSpecifier: string;
	isNamespaceExport: true;
}

export type ExportedSymbol = NamedExportedSymbol | NamespaceExportedSymbol;

/**
 * A Set of exported symbols and data about them
 */
export type ExportedSymbolSet = Set<ExportedSymbol>;

/**
 * A Map between source files and their ExportedSymbolMaps
 */
export type SourceFileToExportedSymbolSet = Map<string, ExportedSymbolSet>;

export interface SourceFileBundlerVisitorOptions extends DeclarationBundlerOptions {
	context: TS.TransformationContext;
	sourceFile: TS.SourceFile;
	otherSourceFiles: TS.SourceFile[];
	lexicalEnvironment: LexicalEnvironment;
	includedSourceFiles: WeakSet<TS.SourceFile>;

	// Declarations are represented by IDs which are mapped a string, indicating the deconflicted names for them
	declarationToDeconflictedBindingMap: Map<number, string>;

	// Some nodes are completely rewritten, under which circumstances the original symbol will be lost. However, it might be relevant to refer to the original symbol.
	// For example, for ImportTypeNodes that are replaced with an identifier, we want the Identifier to refer to the symbol of original quantifier
	nodeToOriginalSymbolMap: WeakMap<TS.Node, TS.Symbol>;
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	preservedImports: Map<string, Set<ImportedSymbol>>;
}
