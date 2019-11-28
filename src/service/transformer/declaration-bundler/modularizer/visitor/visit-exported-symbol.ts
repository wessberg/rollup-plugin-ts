import {SupportedExtensions} from "../../../../../util/get-supported-extensions/get-supported-extensions";
import {ChunkToOriginalFileMap} from "../../../../../util/chunk/get-chunk-to-original-file-map";
import {
	ExportedSymbol,
	ExportedSymbolSet,
	SourceFileToExportedSymbolSet,
	SourceFileToImportedSymbolSet
} from "../../../declaration-pre-bundler/declaration-pre-bundler-options";
import {getChunkFilename} from "../../../declaration-pre-bundler/util/get-chunk-filename/get-chunk-filename";
import {assertDefined} from "../../../../../util/assert-defined/assert-defined";
import {dirname, relative} from "path";
import {ensureHasLeadingDotAndPosix, stripKnownExtension} from "../../../../../util/path/path-util";
import {ChunkForModuleCache} from "../../../declaration/declaration-options";
import {TS} from "../../../../../type/ts";

export interface VisitExportedSymbolOptions {
	typescript: typeof TS;
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	sourceFileToImportedSymbolSet: SourceFileToImportedSymbolSet;
	chunkForModuleCache: ChunkForModuleCache;
	exportedSymbol: ExportedSymbol;
	supportedExtensions: SupportedExtensions;
	chunkToOriginalFileMap: ChunkToOriginalFileMap;
	relativeChunkFileName: string;
	absoluteChunkFileName: string;
	isEntryModule: boolean;
	isEntryChunk: boolean;
	isMultiChunk: boolean;
	module: string;
}

export interface VisitExportedSymbolFromEntryModuleOptions extends VisitExportedSymbolOptions {
	otherModuleExportedSymbols: ExportedSymbolSet;
}

export function exportedSymbolIsReferencedByOtherChunk({
	exportedSymbol,
	isMultiChunk,
	sourceFileToImportedSymbolSet,
	module,
	absoluteChunkFileName,
	...rest
}: VisitExportedSymbolOptions): boolean {
	// It can never be the case if there's only 1 chunk in play here
	if (!isMultiChunk) return false;

	for (const [currentModule, importedSymbols] of sourceFileToImportedSymbolSet) {
		if (module === currentModule) continue;

		const currentModuleChunk = getChunkFilename({...rest, fileName: currentModule});
		if (currentModuleChunk == null || currentModuleChunk.fileName === absoluteChunkFileName) continue;

		for (const importedSymbol of importedSymbols) {
			if (importedSymbol.isExternal) continue;

			// If this export is a default export, but the import isn't, ignore it
			if (
				"defaultExport" in exportedSymbol &&
				exportedSymbol.defaultExport &&
				(!("defaultImport" in importedSymbol) || !importedSymbol.defaultImport)
			) {
				continue;
			}

			// And vice-versa, if the export *isn't* a default export, but the import is, ignore it
			if (
				(!("defaultExport" in exportedSymbol) || !exportedSymbol.defaultExport) &&
				"defaultImport" in importedSymbol &&
				importedSymbol.defaultImport
			) {
				continue;
			}

			// If the import is importing the entire namespace of this module, and this is a default export, ignore it (since default exports are not part of Namespace imports)
			if ("defaultExport" in exportedSymbol && exportedSymbol.defaultExport && "namespaceImport" in importedSymbol) continue;

			const importedPropertyName =
				"propertyName" in importedSymbol && importedSymbol.propertyName != null ? importedSymbol.propertyName : importedSymbol.name;

			// If the names don't match, ignore it
			if ("name" in exportedSymbol && !exportedSymbol.defaultExport && exportedSymbol.name !== importedPropertyName) continue;

			return true;
		}
	}
	return false;
}

export function visitExportedSymbolFromOtherChunk(options: VisitExportedSymbolOptions): TS.ExportDeclaration[] {
	const {exportedSymbol, absoluteChunkFileName, typescript} = options;
	const otherChunkFileName = getChunkFilename({...options, fileName: exportedSymbol.originalModule});

	// Generate a module specifier that points to the referenced module, relative to the current sourcefile
	const relativeToSourceFileDirectory =
		exportedSymbol.isExternal && exportedSymbol.rawModuleSpecifier != null
			? exportedSymbol.rawModuleSpecifier
			: otherChunkFileName == null
			? exportedSymbol.originalModule
			: relative(dirname(absoluteChunkFileName), otherChunkFileName.fileName);
	const moduleSpecifier =
		exportedSymbol.isExternal && exportedSymbol.rawModuleSpecifier != null
			? exportedSymbol.rawModuleSpecifier
			: ensureHasLeadingDotAndPosix(stripKnownExtension(relativeToSourceFileDirectory), false);

	if ("namespaceExport" in exportedSymbol) {
		return [typescript.createExportDeclaration(undefined, undefined, undefined, typescript.createStringLiteral(moduleSpecifier))];
	} else {
		return [
			typescript.createExportDeclaration(
				undefined,
				undefined,
				typescript.createNamedExports([
					typescript.createExportSpecifier(
						exportedSymbol.propertyName == null || exportedSymbol.propertyName === exportedSymbol.name
							? undefined
							: typescript.createIdentifier(exportedSymbol.propertyName),
						typescript.createIdentifier(exportedSymbol.name)
					)
				]),
				typescript.createStringLiteral(moduleSpecifier)
			)
		];
	}
}

export function visitExportedSymbolFromEntryModule({
	typescript,
	exportedSymbol,
	otherModuleExportedSymbols,
	...rest
}: VisitExportedSymbolFromEntryModuleOptions): TS.ExportDeclaration[] {
	const exportDeclarations: TS.ExportDeclaration[] = [];

	// If we're having to do with a namespace export from a module that is part of the same chunk,
	// we can't do something like '{export *}', so we'll have to create an ExportDeclaration with
	// ExportSpecifiers for all exported symbols
	if ("namespaceExport" in exportedSymbol) {
		const exportSpecifiers: TS.ExportSpecifier[] = [];

		if (otherModuleExportedSymbols != null) {
			for (const otherModuleExportedSymbol of otherModuleExportedSymbols) {
				exportDeclarations.push(
					...visitExportedSymbol({
						...rest,
						typescript,
						exportedSymbol: otherModuleExportedSymbol
					})
				);
			}
		}

		if (exportSpecifiers.length > 0) {
			exportDeclarations.push(typescript.createExportDeclaration(undefined, undefined, typescript.createNamedExports(exportSpecifiers)));
		}
	}

	// Otherwise, add an ExportDeclaration without a module specifier
	else {
		let correctedName = exportedSymbol.name;
		let correctedPropertyName = exportedSymbol.propertyName;
		const propertyName = exportedSymbol.propertyName ?? exportedSymbol.name;

		for (const otherModuleExportedSymbol of otherModuleExportedSymbols) {
			if (!("name" in otherModuleExportedSymbol)) continue;

			// If the expression is something like 'export {default}', we'll need to reference the local binding as the property name like 'export {foo as default}'
			if (propertyName === "default") {
				if (otherModuleExportedSymbol.defaultExport) {
					correctedPropertyName = otherModuleExportedSymbol.name;
				}
			} else if ((exportedSymbol.propertyName ?? exportedSymbol.name) === otherModuleExportedSymbol.name) {
				correctedName = otherModuleExportedSymbol.name;
				correctedPropertyName = otherModuleExportedSymbol.propertyName;
			}
		}

		// If this is a default export, make sure to export it correctly: 'export {Foo as default}'
		if (exportedSymbol.defaultExport && correctedPropertyName == null && correctedName !== "default") {
			correctedPropertyName = correctedName;
			correctedName = "default";
		}

		exportDeclarations.push(
			typescript.createExportDeclaration(
				undefined,
				undefined,
				typescript.createNamedExports([
					typescript.createExportSpecifier(
						correctedPropertyName == null || correctedPropertyName === correctedName ? undefined : typescript.createIdentifier(correctedPropertyName),
						typescript.createIdentifier(correctedName)
					)
				])
			)
		);
	}
	return exportDeclarations;
}

export function visitExportedSymbol({exportedSymbol, ...rest}: VisitExportedSymbolOptions): TS.ExportDeclaration[] {
	const {isEntryModule, isEntryChunk, sourceFileToExportedSymbolSet, absoluteChunkFileName} = rest;

	const otherChunkFileName = getChunkFilename({...rest, fileName: exportedSymbol.originalModule});
	const otherModuleExportedSymbols = sourceFileToExportedSymbolSet.get(exportedSymbol.originalModule);

	// If the module originates from a file not part of the compilation (such as an external module),
	// always include the export
	if (otherChunkFileName == null || exportedSymbol.isExternal) {
		if (isEntryModule || !isEntryChunk || exportedSymbolIsReferencedByOtherChunk({...rest, exportedSymbol})) {
			return visitExportedSymbolFromOtherChunk({...rest, exportedSymbol});
		} else {
			return [];
		}
	}

	// Otherwise, assert that exported symbol for the other module has been computed
	assertDefined(otherModuleExportedSymbols, `Expected exported symbols for other module: '${exportedSymbol.originalModule}' to be present`);

	// If the exported module originates from a module within the same chunk
	// include the export only if that module happens to be the entry module or if it was ambient-only and manually included to the emitted chunk, or if any other chunk directly refers to this binding
	if (absoluteChunkFileName === otherChunkFileName.fileName) {
		if (isEntryModule || !isEntryChunk || exportedSymbolIsReferencedByOtherChunk({...rest, exportedSymbol})) {
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
