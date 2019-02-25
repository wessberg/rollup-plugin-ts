import {DECLARATION_EXTENSION, DECLARATION_MAP_EXTENSION} from "../../constant/constant";
import {IFlattenDeclarationsFromRollupChunkOptions} from "./i-flatten-declarations-from-rollup-chunk-options";
import {IFlattenDeclarationsFromRollupChunkResult} from "./i-flatten-declarations-from-rollup-chunk-result";
import {ensureHasLeadingDot, setExtension} from "../path/path-util";
import {declarationTransformers} from "../../service/transformer/declaration-transformers/declaration-transformers";
import {dirname, join} from "path";
import {createPrinter, createProgram, createSourceFile, ScriptKind, ScriptTarget, SourceFile, transform} from "typescript";
import {getChunkFilename} from "../../service/transformer/declaration-transformers/util/get-chunk-filename/get-chunk-filename";
import {ExistingRawSourceMap} from "rollup";
import {declarationTreeShaker} from "../../service/transformer/declaration-tree-shaker/declaration-tree-shaker";

/**
 * Flattens all the modules that are part of the given chunk and returns a single SourceDescription for a flattened file
 * @param {IFlattenDeclarationsFromRollupChunkOptions} opts
 * @returns {SourceDescription}
 */
export function flattenDeclarationsFromRollupChunk({
	chunk,
	declarationOutDir,
	outDir,
	languageServiceHost,
	supportedExtensions,
	entryFileName,
	moduleNames,
	generateMap,
	localModuleNames,
	chunkToOriginalFileMap
}: IFlattenDeclarationsFromRollupChunkOptions): IFlattenDeclarationsFromRollupChunkResult {
	const absoluteChunkFileName = join(outDir, chunk.fileName);
	const declarationFilename = setExtension(chunk.fileName, DECLARATION_EXTENSION);
	const absoluteDeclarationFilename = join(declarationOutDir, declarationFilename);
	const declarationMapFilename = setExtension(chunk.fileName, DECLARATION_MAP_EXTENSION);
	const declarationMapFilenameDir = ensureHasLeadingDot(dirname(declarationMapFilename));
	const absoluteDeclarationMapFilename = join(declarationOutDir, declarationMapFilename);

	const program = createProgram({
		rootNames: localModuleNames,
		options: languageServiceHost.getCompilationSettings(),
		host: languageServiceHost
	});

	const typeChecker = program.getTypeChecker();
	const entrySourceFile = program.getSourceFile(entryFileName);
	const entrySourceFileSymbol = typeChecker.getSymbolAtLocation(entrySourceFile!);

	const usedExports: Set<string> = new Set(
		entrySourceFile == null || entrySourceFileSymbol == null ? [] : typeChecker.getExportsOfModule(entrySourceFileSymbol).map(exportSymbol => exportSymbol.getName())
	);

	const generatedOutDir = languageServiceHost.getCompilationSettings().outDir!;

	let code: string = "";
	let map: ExistingRawSourceMap | undefined;

	program.emit(
		undefined,
		(file, data) => {
			const replacedFile = ensureHasLeadingDot(file.replace(generatedOutDir, ""));
			const replacedFileDir = ensureHasLeadingDot(dirname(replacedFile));

			if (replacedFile.endsWith(DECLARATION_MAP_EXTENSION)) {
				const parsedData = JSON.parse(data) as ExistingRawSourceMap;
				parsedData.file = declarationFilename;
				parsedData.sources = parsedData.sources
					.map(source => {
						if (replacedFileDir !== declarationMapFilenameDir) {
							return join(replacedFileDir, source);
						} else {
							return source;
						}
					})
					// Include only those sources that are actually part of the chunk
					.filter(source => {
						const absoluteSource = join(declarationOutDir, source);
						const chunkFileName = getChunkFilename(absoluteSource, supportedExtensions, chunkToOriginalFileMap);
						return chunkFileName === absoluteChunkFileName;
					});

				// If there are sources for this chunk, include it
				if (parsedData.sources.length > 0) {
					if (map == null) {
						map = parsedData;
					} else {
						map.sources = [...new Set([...map.sources, ...parsedData.sources])];
						map.mappings += parsedData.mappings;
					}
				}
			} else if (replacedFile.endsWith(DECLARATION_EXTENSION)) {
				const replacedData = data.replace(/(\/\/# sourceMappingURL=)(.*\.map)/g, () => "") + "\n";

				// Only add the data if it contains anything else than pure whitespace
				if (/\S/gm.test(replacedData)) {
					code += replacedData;
				}
			}
		},
		undefined,
		true,
		declarationTransformers({
			usedExports,
			chunk,
			supportedExtensions,
			localModuleNames,
			moduleNames,
			entryFileName,
			relativeOutFileName: ensureHasLeadingDot(declarationFilename),
			absoluteOutFileName: absoluteDeclarationFilename,
			chunkToOriginalFileMap,
			identifiersForDefaultExportsForModules: new Map()
		})
	);

	// Run a tree-shaking pass on the code
	const result = transform(
		createSourceFile(declarationFilename, code, ScriptTarget.ESNext, true, ScriptKind.TS),
		declarationTreeShaker({relativeOutFileName: declarationFilename}).afterDeclarations!,
		languageServiceHost.getCompilationSettings()
	);

	// Print the Source code and update the code with it
	code = createPrinter({newLine: languageServiceHost.getCompilationSettings().newLine}).printFile(result.transformed[0] as SourceFile);

	// Add a source mapping URL if a map should be generated
	if (generateMap) {
		code += (code.endsWith("\n") ? "" : "\n") + `//# sourceMappingURL=${declarationMapFilename}`;
	}

	return {
		sourceDescription: {
			code,
			...(map == null ? {} : {map: JSON.stringify(map)})
		},
		declarationFilename,
		absoluteDeclarationFilename,
		declarationMapFilename,
		absoluteDeclarationMapFilename
	};
}
