import {TS} from "../../../../../type/ts";
import {CompatFactory} from "../source-file-bundler/source-file-bundler-visitor-options";

export interface ExportedSymbolBase {}

export interface NamedExportedSymbol extends ExportedSymbolBase {
	// The raw module specifier with no modifications
	moduleSpecifier: string | undefined;
	isDefaultExport: boolean;
	name: TS.Identifier;
	propertyName: TS.Identifier;
}

export interface NamespaceExportedSymbol extends ExportedSymbolBase {
	// The raw module specifier with no modifications
	moduleSpecifier: string;
	isNamespaceExport: true;
	// If it has a name, it isn't a barrel export, but instead an export of the entire namespace under a given binding name
	name: TS.Identifier | undefined;
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

export interface TrackExportsOptions {
	typescript: typeof TS;
	compatFactory: CompatFactory;
	sourceFile: TS.SourceFile;
}

export interface TrackExportsTransformerVisitorOptions<T extends TS.Node> extends TrackExportsOptions {
	node: T;

	childContinuation<U extends TS.Node>(node: U): void;
	continuation<U extends TS.Node>(node: U): void;
	markAsExported(symbol: ExportedSymbol): void;
}
