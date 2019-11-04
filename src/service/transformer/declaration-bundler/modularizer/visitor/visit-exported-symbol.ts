import {createExportDeclaration, createExportSpecifier, createIdentifier, createNamedExports, createStringLiteral, ExportDeclaration, ExportSpecifier} from "typescript";
import {SupportedExtensions} from "../../../../../util/get-supported-extensions/get-supported-extensions";
import {ChunkToOriginalFileMap} from "../../../../../util/chunk/get-chunk-to-original-file-map";
import {ExportedSymbol, ExportedSymbolSet, SourceFileToExportedSymbolSet} from "../../../declaration-pre-bundler/declaration-pre-bundler-options";
import {getChunkFilename} from "../../../declaration-pre-bundler/util/get-chunk-filename/get-chunk-filename";
import {assertDefined} from "../../../../../util/assert-defined/assert-defined";
import {dirname, relative} from "path";
import {ensureHasLeadingDotAndPosix, stripKnownExtension} from "../../../../../util/path/path-util";

export interface VisitExportedSymbolOptions {
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	exportedSymbol: ExportedSymbol;
	supportedExtensions: SupportedExtensions;
	chunkToOriginalFileMap: ChunkToOriginalFileMap;
	relativeChunkFileName: string;
	absoluteChunkFileName: string;
	isEntryModule: boolean;
	module: string;
}

export interface VisitExportedSymbolFromEntryModuleOptions extends VisitExportedSymbolOptions {
	otherModuleExportedSymbols: ExportedSymbolSet;
}

export function visitExportedSymbolFromOtherChunk ({exportedSymbol, supportedExtensions, chunkToOriginalFileMap, relativeChunkFileName}: VisitExportedSymbolOptions): ExportDeclaration[] {
	const otherChunkFileName = getChunkFilename(exportedSymbol.originalModule, supportedExtensions, chunkToOriginalFileMap);

	// Generate a module specifier that points to the referenced module, relative to the current sourcefile
	const relativeToSourceFileDirectory = exportedSymbol.isExternal && exportedSymbol.rawModuleSpecifier != null ? exportedSymbol.rawModuleSpecifier : otherChunkFileName == null ? exportedSymbol.originalModule : relative(dirname(relativeChunkFileName), otherChunkFileName.fileName);
	const moduleSpecifier = exportedSymbol.isExternal && exportedSymbol.rawModuleSpecifier != null ? exportedSymbol.rawModuleSpecifier : ensureHasLeadingDotAndPosix(stripKnownExtension(relativeToSourceFileDirectory), false);

	if ("namespaceExport" in exportedSymbol) {
		return [
			createExportDeclaration(
				undefined,
				undefined,
				undefined,
				createStringLiteral(moduleSpecifier)
			)
		];
	} else {

		return [
			createExportDeclaration(
				undefined,
				undefined,
				createNamedExports([
					createExportSpecifier(exportedSymbol.propertyName == null ? undefined : createIdentifier(exportedSymbol.propertyName), createIdentifier(exportedSymbol.name))
				]),
				createStringLiteral(moduleSpecifier)
			)
		];
	}
}

export function visitExportedSymbolFromEntryModule ({exportedSymbol, otherModuleExportedSymbols, ...rest}: VisitExportedSymbolFromEntryModuleOptions): ExportDeclaration[] {
	const exportDeclarations: ExportDeclaration[] = [];

	// If we're having to do with a namespace export from a module that is part of the same chunk,
	// we can't do something like '{export *}', so we'll have to create an ExportDeclaration with
	// ExportSpecifiers for all exported symbols
	if ("namespaceExport" in exportedSymbol) {
		const exportSpecifiers: ExportSpecifier[] = [];

		if (otherModuleExportedSymbols != null) {
			for (const otherModuleExportedSymbol of otherModuleExportedSymbols) {
				exportDeclarations.push(...visitExportedSymbol({
					...rest,
					exportedSymbol: otherModuleExportedSymbol
				}));
			}
		}

		if (exportSpecifiers.length > 0) {
			exportDeclarations.push(
				createExportDeclaration(
					undefined,
					undefined,
					createNamedExports(exportSpecifiers)
				)
			);
		}
	}

	// Otherwise, add an ExportDeclaration without a module specifier
	else {
		let correctedName = exportedSymbol.name;
		let correctedPropertyName = exportedSymbol.propertyName;

		for (const otherModuleExportedSymbol of otherModuleExportedSymbols) {
			if (!("name" in otherModuleExportedSymbol)) continue;
			if ((exportedSymbol.propertyName ?? exportedSymbol.name) === otherModuleExportedSymbol.name) {
				correctedName = otherModuleExportedSymbol.name;
				correctedPropertyName = otherModuleExportedSymbol.propertyName;
			}
		}
		exportDeclarations.push(
			createExportDeclaration(
				undefined,
				undefined,
				createNamedExports([
					createExportSpecifier(correctedPropertyName == null ? undefined : createIdentifier(correctedPropertyName), createIdentifier(correctedName))
				])
			)
		);
	}
	return exportDeclarations;
}

export function visitExportedSymbol ({exportedSymbol, ...rest}: VisitExportedSymbolOptions): ExportDeclaration[] {
	const {isEntryModule, sourceFileToExportedSymbolSet, supportedExtensions, absoluteChunkFileName, chunkToOriginalFileMap} = rest;

	const otherChunkFileName = getChunkFilename(exportedSymbol.originalModule, supportedExtensions, chunkToOriginalFileMap);
	const otherModuleExportedSymbols = sourceFileToExportedSymbolSet.get(exportedSymbol.originalModule);

	// If the module originates from a file not part of the compilation (such as an external module),
	// always include the export
	if (otherChunkFileName == null || exportedSymbol.isExternal) {
		if (isEntryModule) {
			return visitExportedSymbolFromOtherChunk({...rest, exportedSymbol});
		}

		else {
			return [];
		}
	}

	// Otherwise, assert that exported symbol for the other module has been computed
	assertDefined(otherModuleExportedSymbols, `Expected exported symbols for other module: '${exportedSymbol.originalModule}' to be present`);

	// If the exported module originates from a module within the same chunk
	// include the export only if that module happens to be the entry module or if it was ambient-only and manually included to the emitted chunk
	if (absoluteChunkFileName === otherChunkFileName.fileName) {
		if (isEntryModule) {
			return visitExportedSymbolFromEntryModule({...rest, exportedSymbol, otherModuleExportedSymbols});
		}

		// Otherwise, there's no need to export the symbol since it is only used internally and already part of the chunk
		else {
			return [];
		}
	}

	// Otherwise, add an export that exports the binding from the referenced chunk
	else {
		return visitExportedSymbolFromOtherChunk({...rest, exportedSymbol});
	}
}