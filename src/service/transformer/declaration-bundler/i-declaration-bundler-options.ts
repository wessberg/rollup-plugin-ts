import {Node, TypeChecker} from "typescript";
import {Resolver} from "../../../util/resolve-id/resolver";
import {MergedChunk} from "../../../util/chunk/merge-chunks-with-ambient-dependencies";
import {SupportedExtensions} from "../../../util/get-supported-extensions/get-supported-extensions";
import {TypescriptPluginOptions} from "../../../plugin/i-typescript-plugin-options";

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

export interface ExportedSymbol {
	name: string;
	propertyName: string | undefined;

	// The original module hosting the symbol. If it couldn't be resolved, it will be undefined
	originalModule: string | undefined;
}

/**
 * A Map between exported symbols and data about them
 */
export type ExportedSymbolMap = Map<string, ExportedSymbol>;

/**
 * A Map between source files and their LocalSymbolMaps
 */
export type SourceFileToExportedSymbolMap = Map<string, ExportedSymbolMap>;

export interface IDeclarationBundlerOptions {
	resolver: Resolver;
	pluginOptions: TypescriptPluginOptions;
	chunk: MergedChunk;
	usedExports: Set<string>;
	typeChecker: TypeChecker;
	supportedExtensions: SupportedExtensions;
	localModuleNames: string[];
	moduleNames: string[];
	relativeOutFileName: string;
	absoluteOutFileName: string;
	entryFileNames: string[];
	chunkToOriginalFileMap: Map<string, string[]>;
	identifiersForDefaultExportsForModules: Map<string, [string, Node]>;

	// When deconflicting nodes, their identifiers may change.
	// From inside another module they might be imported under their original name.
	// This map keeps track of renamed identifiers such that imports can be rewritten too (as well as all usage from within foreign modules)
	updatedIdentifierNamesForModuleMap: Map<string, Map<string, string>>;
	updatedIdentifierNamesForModuleMapReversed: Map<string, Map<string, string>>;
}
