import {DECLARATION_EXTENSION, DECLARATION_MAP_EXTENSION, SOURCE_MAP_COMMENT, SOURCE_MAP_COMMENT_REGEXP, TS_EXTENSION} from "../../constant/constant";
import {IFlattenDeclarationsFromRollupChunkOptions} from "./i-flatten-declarations-from-rollup-chunk-options";
import {IFlattenDeclarationsFromRollupChunkResult} from "./i-flatten-declarations-from-rollup-chunk-result";
import {setExtension, stripExtension} from "../path/path-util";
import {declarationTransformers} from "../../service/transformer/declaration-transformers/declaration-transformers";
import {isDeclarationOutputFile} from "../is-declaration-output-file/is-declaration-output-file";
import {basename, join} from "path";

/**
 * Flattens all the modules that are part of the given chunk and returns a single SourceDescription for a flattened file
 * @param {IFlattenDeclarationsFromRollupChunkOptions} opts
 * @returns {SourceDescription}
 */
export function flattenDeclarationsFromRollupChunk({
	chunk,
	generateMap,
	declarationOutDir,
	languageService,
	languageServiceHost,
	emitCache,
	supportedExtensions,
	entryFileName,
	moduleNames,
	localModuleNames,
	chunkToOriginalFileMap
}: IFlattenDeclarationsFromRollupChunkOptions): IFlattenDeclarationsFromRollupChunkResult {
	const declarationBundleSourceFileName = setExtension(stripExtension(chunk.fileName) + "___declaration___", TS_EXTENSION);

	const declarationFilename = setExtension(chunk.fileName, DECLARATION_EXTENSION);
	const absoluteDeclarationFilename = join(declarationOutDir, declarationFilename);
	const declarationMapFilename = setExtension(chunk.fileName, DECLARATION_MAP_EXTENSION);
	const absoluteDeclarationMapFilename = join(declarationOutDir, declarationMapFilename);

	let code = "";
	for (const moduleName of localModuleNames) {
		const emitOutput = emitCache.get({dtsOnly: true, fileName: moduleName, languageService});
		const declarationFile = emitOutput.outputFiles.find(isDeclarationOutputFile);
		if (declarationFile == null) continue;

		code += `${declarationFile.text.replace(SOURCE_MAP_COMMENT_REGEXP, "")}\n`;
	}
	languageServiceHost.addFile({file: declarationBundleSourceFileName, code});

	code = "";
	let map: string | undefined;

	const program = languageService.getProgram()!;
	const typeChecker = program.getTypeChecker();
	const entrySourceFile = program.getSourceFile(entryFileName);
	const entrySourceFileSymbol = typeChecker.getSymbolAtLocation(entrySourceFile!);

	const usedExports: Set<string> = new Set(
		entrySourceFile == null || entrySourceFileSymbol == null ? [] : typeChecker.getExportsOfModule(entrySourceFileSymbol).map(exportSymbol => exportSymbol.getName())
	);

	program.emit(
		program.getSourceFile(declarationBundleSourceFileName),
		(file, data) => {
			if (file.endsWith(DECLARATION_MAP_EXTENSION)) {
				let alteredData = data;
				while (
					alteredData.includes(declarationBundleSourceFileName) ||
					alteredData.includes(basename(declarationBundleSourceFileName)) ||
					alteredData.includes(basename(setExtension(declarationBundleSourceFileName, DECLARATION_EXTENSION))) ||
					alteredData.includes(setExtension(declarationBundleSourceFileName, DECLARATION_EXTENSION))
				) {
					alteredData = alteredData
						.replace(declarationBundleSourceFileName, declarationFilename)
						.replace(basename(declarationBundleSourceFileName), basename(declarationFilename))
						.replace(setExtension(declarationBundleSourceFileName, DECLARATION_EXTENSION), setExtension(declarationFilename, DECLARATION_EXTENSION))
						.replace(basename(setExtension(declarationBundleSourceFileName, DECLARATION_EXTENSION)), basename(setExtension(declarationFilename, DECLARATION_EXTENSION)));
				}
				map = alteredData;
			} else code += `${data.replace(SOURCE_MAP_COMMENT_REGEXP, "")}\n${generateMap ? `${SOURCE_MAP_COMMENT}=${basename(declarationMapFilename)}` : ``}`;
		},
		undefined,
		true,
		declarationTransformers({
			usedExports,
			outFileName: absoluteDeclarationFilename,
			supportedExtensions,
			localModuleNames,
			moduleNames,
			entryFileName,
			typeChecker: program.getTypeChecker(),
			chunkToOriginalFileMap,
			fileToRewrittenIncludedExportModuleSpecifiersMap: new Map()
		})
	);

	languageServiceHost.deleteFile(declarationBundleSourceFileName);

	return {
		sourceDescription: {
			code,
			map
		},
		declarationFilename,
		absoluteDeclarationFilename,
		declarationMapFilename,
		absoluteDeclarationMapFilename
	};
}
