import {TS} from "../../../../../type/ts";
import {DeclarationBundlerOptions} from "../../declaration-bundler-options";

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

export interface TrackExportsOptions extends DeclarationBundlerOptions {
	sourceFile: TS.SourceFile;
}

export interface TrackExportsTransformerVisitorOptions<T extends TS.Node> extends TrackExportsOptions {
	node: T;

	childContinuation<U extends TS.Node>(node: U): void;
	continuation<U extends TS.Node>(node: U): void;
	markAsExported(symbol: ExportedSymbol): void;
}
