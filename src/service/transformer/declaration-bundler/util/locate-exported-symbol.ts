import {
	NamedExportedSymbol,
	NamespaceExportedSymbol,
	SourceFileToExportedSymbolSet,
	SourceFileWithChunk
} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";

export interface LocateExportedSymbolContext {
	sourceFile: string;
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	moduleSpecifierToSourceFileMap: Map<string, SourceFileWithChunk>;
}

export interface LocateExportedSymbolOptionsBase {
	moduleSpecifier?: string;
}

export interface LocateDefaultNamedExportedSymbolOptions extends LocateExportedSymbolOptionsBase {
	defaultExport: true;
}

export interface LocateNamedExportedSymbolOptions extends LocateExportedSymbolOptionsBase {
	defaultExport: false;
	name?: string;
	propertyName?: string;
}

export interface LocateNamespaceExportedSymbolOptions extends LocateExportedSymbolOptionsBase {
	namespaceExport: true;
}

export type LocateExportedSymbolOptions =
	| LocateNamespaceExportedSymbolOptions
	| LocateNamedExportedSymbolOptions
	| LocateDefaultNamedExportedSymbolOptions;

export function locateExportedSymbolForSourceFile(
	options: LocateDefaultNamedExportedSymbolOptions,
	context: LocateExportedSymbolContext,
	seenSourceFiles?: Set<string>
): (NamedExportedSymbol & {isDefaultExport: true}) | undefined;
export function locateExportedSymbolForSourceFile(
	options: LocateNamedExportedSymbolOptions,
	context: LocateExportedSymbolContext,
	seenSourceFiles?: Set<string>
): (NamedExportedSymbol & {isDefaultExport: false}) | undefined;
export function locateExportedSymbolForSourceFile(
	options: LocateNamespaceExportedSymbolOptions,
	context: LocateExportedSymbolContext,
	seenSourceFiles?: Set<string>
): NamespaceExportedSymbol | undefined;
export function locateExportedSymbolForSourceFile(
	options: LocateExportedSymbolOptions,
	context: LocateExportedSymbolContext,
	seenSourceFiles?: Set<string>
): (NamedExportedSymbol & {isDefaultExport: boolean}) | NamespaceExportedSymbol | undefined;
export function locateExportedSymbolForSourceFile(
	options: LocateExportedSymbolOptions,
	context: LocateExportedSymbolContext,
	seenSourceFiles: Set<string> = new Set()
): (NamedExportedSymbol & {isDefaultExport: boolean}) | NamespaceExportedSymbol | undefined {
	seenSourceFiles.add(context.sourceFile);
	const exportedSymbols = context.sourceFileToExportedSymbolSet.get(context.sourceFile);
	if (exportedSymbols == null) return undefined;
	const exportedSymbolsArr = [...exportedSymbols];

	if ("defaultExport" in options && options.defaultExport) {
		return exportedSymbolsArr.find(
			exportedSymbol =>
				"isDefaultExport" in exportedSymbol &&
				exportedSymbol.isDefaultExport &&
				(!("moduleSpecifier" in options) || exportedSymbol.moduleSpecifier === options.moduleSpecifier)
		);
	}

	if ("namespaceExport" in options) {
		return exportedSymbolsArr.find(
			exportedSymbol =>
				"isNamespaceExport" in exportedSymbol && (!("moduleSpecifier" in options) || exportedSymbol.moduleSpecifier === options.moduleSpecifier)
		);
	} else {
		const matchedNamedExport = exportedSymbolsArr.find(
			exportedSymbol =>
				"isDefaultExport" in exportedSymbol &&
				!exportedSymbol.isDefaultExport &&
				(!("name" in options) || exportedSymbol.name.text === options.name) &&
				(!("propertyName" in options) || exportedSymbol.propertyName.text === options.propertyName) &&
				(!("moduleSpecifier" in options) || exportedSymbol.moduleSpecifier === options.moduleSpecifier)
		);
		if (matchedNamedExport != null) {
			return matchedNamedExport;
		} else {
			for (const namespaceExport of exportedSymbolsArr.filter(
				(exportedSymbol): exportedSymbol is NamespaceExportedSymbol => "isNamespaceExport" in exportedSymbol
			)) {
				const sourceFileWithChunk = context.moduleSpecifierToSourceFileMap.get(namespaceExport.moduleSpecifier);
				if (sourceFileWithChunk != null && !seenSourceFiles.has(sourceFileWithChunk.sourceFile.fileName)) {
					const recursiveResult = locateExportedSymbolForSourceFile(
						options,
						{...context, sourceFile: sourceFileWithChunk.sourceFile.fileName},
						seenSourceFiles
					);
					if (recursiveResult != null) return recursiveResult;
				}
			}
		}
	}

	return undefined;
}
