import {DECLARATION_EXTENSION, DECLARATION_MAP_EXTENSION} from "../../constant/constant";
import {IFlattenDeclarationsFromRollupChunkOptions} from "./i-flatten-declarations-from-rollup-chunk-options";
import {IFlattenDeclarationsFromRollupChunkResult} from "./i-flatten-declarations-from-rollup-chunk-result";
import {ensurePosix, setExtension} from "../path/path-util";
import {declarationBundler} from "../../service/transformer/declaration-bundler/declaration-bundler";
import {dirname, join, normalize, relative} from "path";
import {createPrinter, createProgram, createSourceFile, ScriptKind, ScriptTarget, SourceFile, transform, TransformerFactory} from "typescript";
import {getChunkFilename} from "../../service/transformer/declaration-bundler/util/get-chunk-filename/get-chunk-filename";
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
	cwd,
	languageServiceHost,
	supportedExtensions,
	entryFileNames,
	moduleNames,
	generateMap,
	localModuleNames,
	chunkToOriginalFileMap
}: IFlattenDeclarationsFromRollupChunkOptions): IFlattenDeclarationsFromRollupChunkResult {
	const absoluteChunkFileName = join(outDir, chunk.fileName);
	const declarationFilename = setExtension(chunk.fileName, DECLARATION_EXTENSION);
	const absoluteDeclarationFilename = join(declarationOutDir, declarationFilename);
	const declarationMapFilename = setExtension(chunk.fileName, DECLARATION_MAP_EXTENSION);
	const declarationMapDirname = join(declarationOutDir, dirname(declarationMapFilename));
	const absoluteDeclarationMapFilename = join(declarationOutDir, declarationMapFilename);

	const program = createProgram({
		rootNames: localModuleNames,
		options: languageServiceHost.getCompilationSettings(),
		host: languageServiceHost
	});

	const typeChecker = program.getTypeChecker();
	const entrySourceFiles = entryFileNames.map(entryFileName => program.getSourceFile(entryFileName));
	const entrySourceFileSymbols = entrySourceFiles.map(entrySourceFile => typeChecker.getSymbolAtLocation(entrySourceFile!));

	const usedExports: Set<string> = new Set();

	for (const entrySourceFileSymbol of entrySourceFileSymbols) {
		if (entrySourceFileSymbol == null) continue;
		const exports = typeChecker.getExportsOfModule(entrySourceFileSymbol).map(exportSymbol => exportSymbol.getName());
		for (const exportedSymbol of exports) {
			usedExports.add(exportedSymbol);
		}
	}

	const generatedOutDir = languageServiceHost.getCompilationSettings().outDir!;

	let code: string = "";
	let map: ExistingRawSourceMap | undefined;

	program.emit(
		undefined,
		(file, data) => {
			const replacedFile = normalize(file.replace(generatedOutDir, ""));
			const replacedFileDir = normalize(dirname(replacedFile));

			if (replacedFile.endsWith(DECLARATION_MAP_EXTENSION)) {
				const parsedData = JSON.parse(data) as ExistingRawSourceMap;
				parsedData.file = declarationFilename;
				parsedData.sources = parsedData.sources
					.map(source => {
						const correctedSource = join(replacedFileDir, source);
						const posixSource = ensurePosix(correctedSource);

						// Generated files will follow the structure: '<generated-sub-dir>/<path>', and as such,
						// all sources will be relative to the source content as if they were emitted to a subfolder of
						// cwd. Because, of that, we first need to correct the source path so it is instead relative
						// to cwd
						const sourceFromCwd = posixSource.startsWith("../") ? posixSource.slice("../".length) : posixSource;
						const absoluteSourceFromCwd = join(cwd, sourceFromCwd);
						return relative(declarationMapDirname, absoluteSourceFromCwd);
					})
					// Include only those sources that are actually part of the chunk
					.filter(source => {
						const absoluteSource = join(declarationMapDirname, source);
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
		declarationBundler({
			usedExports,
			chunk,
			supportedExtensions,
			localModuleNames,
			moduleNames,
			entryFileNames,
			relativeOutFileName: declarationFilename,
			absoluteOutFileName: absoluteDeclarationFilename,
			chunkToOriginalFileMap,
			typeChecker,
			identifiersForDefaultExportsForModules: new Map()
		})
	);

	// Run a tree-shaking pass on the code
	const result = transform(
		createSourceFile(declarationFilename, code, ScriptTarget.ESNext, true, ScriptKind.TS),
		declarationTreeShaker({relativeOutFileName: declarationFilename}).afterDeclarations! as TransformerFactory<SourceFile>[],
		languageServiceHost.getCompilationSettings()
	);

	// Print the Source code and update the code with it
	code = createPrinter({newLine: languageServiceHost.getCompilationSettings().newLine}).printFile(result.transformed[0]);

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
