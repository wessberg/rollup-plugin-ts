import {TS} from "../../../../../type/ts";
import {NodeIdentifierCache} from "../../../declaration-bundler/transformers/trace-identifiers/trace-identifiers";
import {Resolver} from "../../../../../util/resolve-id/resolver";

export interface ImportedSymbolBase {
	moduleSpecifier: string;
}

export interface NamedImportedSymbol extends ImportedSymbolBase {
	isDefaultImport: boolean;
	name: TS.Identifier;
	propertyName: TS.Identifier;
}

export interface NamespaceImportedSymbol extends ImportedSymbolBase {
	isNamespaceImport: true;
	name: TS.Identifier;
}

export interface ClauseLessImportedSymbol extends ImportedSymbolBase {
	isClauseLessImport: true;
}

export type ImportedSymbol = NamedImportedSymbol | NamespaceImportedSymbol | ClauseLessImportedSymbol;

/**
 * A Set of imported symbols and data about them
 */
export type ImportedSymbolSet = Set<ImportedSymbol>;

/**
 * A Map between source files and their ImportedSymbolMaps
 */
export type SourceFileToImportedSymbolSet = Map<string, ImportedSymbolSet>;

export interface TrackImportsOptions {
	typescript: typeof TS;
	sourceFile: TS.SourceFile;
	sourceFileToImportedSymbolSet: SourceFileToImportedSymbolSet;
	nodeIdentifierCache: NodeIdentifierCache;
	resolver: Resolver;
}

export interface TrackImportsTransformerVisitorOptions<T extends TS.Node> extends TrackImportsOptions {
	node: T;

	childContinuation<U extends TS.Node>(node: U): void;
	continuation<U extends TS.Node>(node: U): void;
	markAsImported(symbol: ImportedSymbol): void;
}
