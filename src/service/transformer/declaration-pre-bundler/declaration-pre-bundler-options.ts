import {Node, TypeChecker} from "typescript";
import {DeclarationOptions} from "../declaration/declaration-options";

/**
 * A Set of generated variable names
 */
export type GeneratedVariableNameSet = Set<string>;

/**
 * A Map between source files and their GeneratedVariableNameSets
 */
export type SourceFileToGeneratedVariableNameSet = Map<string, GeneratedVariableNameSet>;

/**
 * Each symbol in a file may be part of the modules own declarations such as variable- or function declarations,
 * but it may also be part of an import from an external module in which case it may directly reference a local symbol
 * from another file
 */
export interface LocalSymbol {
	// The original module hosting the symbol. If it couldn't be resolved, it will be undefined
	originalModule: string|undefined;
	// Some local symbols may be renamed to avoid conflicts with other symbols inside generated chunks
	deconflictedName: string|undefined;
}

/**
 * A Map between symbols and data about them
 */
export type LocalSymbolMap = Map<string, LocalSymbol>;

/**
 * A Map between source files and their LocalSymbolMaps
 */
export type SourceFileToLocalSymbolMap = Map<string, LocalSymbolMap>;

export interface ImportedSymbolBase {
	name: string;

	// The original module hosting the symbol. If it couldn't be resolved, it will be undefined
	originalModule: string;

	// The raw module specifier with no modifications
	rawModuleSpecifier: string|undefined;
	// Whether or not the module is external
	isExternal: boolean;

	// The original Node, such as the original ImportSpecifier or Identifier
	node: Node;
}

export interface NamedImportedSymbol extends ImportedSymbolBase {
	defaultImport: boolean;
	propertyName: string|undefined;
}

export interface NamespaceImportedSymbol extends ImportedSymbolBase {
	namespaceImport: true;
}

export type ImportedSymbol = NamedImportedSymbol|NamespaceImportedSymbol;

/**
 * A Map between imported symbols and data about them
 */
export type ImportedSymbolSet = Set<ImportedSymbol>;

/**
 * A Map between source files and their ImportedSymbolSets
 */
export type SourceFileToImportedSymbolSet = Map<string, ImportedSymbolSet>;

export interface ExportedSymbolBase {
	// The original module hosting the symbol. If it couldn't be resolved, it will be undefined
	originalModule: string;

	// The raw module specifier with no modifications
	rawModuleSpecifier: string|undefined;
	// Whether or not the module is external
	isExternal: boolean;

	// The original Node that was exported
	node: Node;
}

export interface NamedExportedSymbol extends ExportedSymbolBase {
	name: string;
	defaultExport: boolean;
	propertyName: string|undefined;
}

export interface NamespaceExportedSymbol extends ExportedSymbolBase {
	namespaceExport: true;
}

export type ExportedSymbol = NamedExportedSymbol|NamespaceExportedSymbol;

/**
 * A Set of exported symbols and data about them
 */
export type ExportedSymbolSet = Set<ExportedSymbol>;

/**
 * A Map between source files and their ExportedSymbolMaps
 */
export type SourceFileToExportedSymbolSet = Map<string, ExportedSymbolSet>;

export interface DeclarationPreBundlerOptions extends DeclarationOptions {
	typeChecker: TypeChecker;
	generateUniqueVariableName (candidate: string, sourceFileName: string): string;
}
