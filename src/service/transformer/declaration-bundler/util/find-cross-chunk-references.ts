import {
	ImportedSymbol,
	SourceFileToImportedSymbolSet
} from "../../cross-chunk-reference-tracker/transformers/track-imports-transformer/track-imports-transformer-visitor-options";
import {
	ExportedSymbol,
	SourceFileToExportedSymbolSet
} from "../../cross-chunk-reference-tracker/transformers/track-exports-transformer/track-exports-transformer-visitor-options";
import {ChunkToOriginalFileMap} from "../../../../util/chunk/get-chunk-to-original-file-map";
import {TS} from "../../../../type/ts";
import {getChunkFilename} from "./get-chunk-filename";
import {SupportedExtensions} from "../../../../util/get-supported-extensions/get-supported-extensions";
import {ModuleSpecifierToSourceFileMap} from "../declaration-bundler-options";

export interface FindCrossChunkReferencesOptions {
	from: TS.SourceFile;
	sourceFileToImportedSymbolSet: SourceFileToImportedSymbolSet;
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	chunkToOriginalFileMap: ChunkToOriginalFileMap;
	supportedExtensions: SupportedExtensions;
	moduleSpecifierToSourceFileMap: ModuleSpecifierToSourceFileMap;
}

export function findCrossChunkReferences(options: FindCrossChunkReferencesOptions): ImportedSymbol | ExportedSymbol[] {
	const {from, sourceFileToExportedSymbolSet, moduleSpecifierToSourceFileMap} = options;
	const currentChunk = getChunkFilename({...options, fileName: from.fileName});
	if (currentChunk == null) return [];

	for (const [otherSourceFile, exportedSymbols] of sourceFileToExportedSymbolSet.entries()) {
		const otherSourceFileChunk = getChunkFilename({...options, fileName: otherSourceFile});
		if (otherSourceFileChunk === currentChunk) continue;

		for (const exportedSymbol of exportedSymbols) {
			if (exportedSymbol.moduleSpecifier == null) continue;
			const matchingSourceFile = moduleSpecifierToSourceFileMap.get(exportedSymbol.moduleSpecifier);
			if (matchingSourceFile == null) continue;
			const matchingSourceFileChunk = getChunkFilename({...options, fileName: matchingSourceFile.fileName});
			if (matchingSourceFileChunk == null || matchingSourceFileChunk !== currentChunk) continue;

			// Here we have an export coming from a foreign chunk but referencing *this* chunk
			console.log("match!");
			console.log({
				exportedSymbol,
				otherChunk: matchingSourceFileChunk,
				currentChunk
			});
		}
	}

	return [];
}
