import {Node, Printer, TypeChecker} from "typescript";
import {Resolver} from "../../../util/resolve-id/resolver";
import {SupportedExtensions} from "../../../util/get-supported-extensions/get-supported-extensions";
import {TypescriptPluginOptions} from "../../../plugin/i-typescript-plugin-options";
import {NodeIdentifierCache} from "../declaration-bundler/util/get-identifiers-for-node";

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
	originalModule: string | undefined;
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
	originalModule: string | undefined;

	// The original Node, such as the original ImportSpecifier or Identifier
	node: Node;
}

export interface NamedImportedSymbol extends ImportedSymbolBase {
	defaultImport: boolean;
	propertyName: string | undefined;
}

export interface NamespaceImportedSymbol extends ImportedSymbolBase {
	namespaceImport: true;
}

export type ImportedSymbol = NamedImportedSymbol | NamespaceImportedSymbol;

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
	originalModule: string | undefined;

	// The original Node that was exported
	node: Node;
}

export interface NamedExportedSymbol extends ExportedSymbolBase {
	name: string;
	defaultExport: boolean;
	propertyName: string | undefined;
}

export interface NamespaceExportedSymbol extends ExportedSymbolBase {
	namespaceExport: true;
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

export interface DeclarationPreBundlerOptions {
	printer: Printer;
	resolver: Resolver;

	// A cache between nodes and the identifier names for them
	nodeIdentifierCache: NodeIdentifierCache;

	pluginOptions: TypescriptPluginOptions;
	usedExports: Set<string>;
	typeChecker: TypeChecker;
	supportedExtensions: SupportedExtensions;
	localModuleNames: string[];
	relativeOutFileName: string;
	absoluteOutFileName: string;
	entryFileNames: string[];
	chunkToOriginalFileMap: Map<string, string[]>;

	// When deconflicting nodes, their identifiers may change.
	// From inside another module they might be imported under their original name.
	// This map keeps track of renamed identifiers such that imports can be rewritten too (as well as all usage from within foreign modules)
	updatedIdentifierNamesForModuleMap: Map<string, Map<string, string>>;
	updatedIdentifierNamesForModuleMapReversed: Map<string, Map<string, string>>;
}
