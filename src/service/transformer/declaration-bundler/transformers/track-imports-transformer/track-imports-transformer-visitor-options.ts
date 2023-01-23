import type {TS} from "../../../../../type/ts.js";

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
}

export interface TrackImportsTransformerVisitorOptions<T extends TS.Node> extends TrackImportsOptions {
	node: T;
	shouldDeepTraverse: boolean;

	childContinuation<U extends TS.Node>(node: U): void;
	continuation<U extends TS.Node>(node: U): void;
	markAsImported(symbol: ImportedSymbol): void;
}
