import {DECLARATION_EXTENSION, DECLARATION_MAP_EXTENSION, SOURCE_MAP_COMMENT, SOURCE_MAP_COMMENT_REGEXP, TS_EXTENSION} from "../../constant/constant";
import {IFlattenDeclarationsFromRollupChunkOptions} from "./i-flatten-declarations-from-rollup-chunk-options";
import {IFlattenDeclarationsFromRollupChunkResult} from "./i-flatten-declarations-from-rollup-chunk-result";
import {setExtension, stripExtension} from "../path/path-util";
import {declarationTransformers} from "../../service/transformer/declaration-transformers/declaration-transformers";

/**
 * Flattens all the modules that are part of the given chunk and returns a single SourceDescription for a flattened file
 * @param {IFlattenDeclarationsFromRollupChunkOptions} opts
 * @returns {SourceDescription}
 */
export function flattenDeclarationsFromRollupChunk ({chunk, languageService, languageServiceHost, generateMap}: IFlattenDeclarationsFromRollupChunkOptions): IFlattenDeclarationsFromRollupChunkResult {
	const moduleNames = Object.keys(chunk.modules);
	const entryFileName = moduleNames.slice(-1)[0];

	const declarationBundleSourceFileName = setExtension(stripExtension(chunk.fileName) + "___declaration___", TS_EXTENSION);
	const declarationFilename = setExtension(chunk.fileName, DECLARATION_EXTENSION);
	const declarationMapFilename = setExtension(chunk.fileName, DECLARATION_MAP_EXTENSION);

	let program = languageService.getProgram()!;
	const typeChecker = program.getTypeChecker();
	const entrySourceFile = program.getSourceFile(entryFileName);

	const usedExports: Set<string> = new Set(entrySourceFile == null ? [] : typeChecker.getExportsOfModule(typeChecker.getSymbolAtLocation(entrySourceFile)!)
		.map(exportSymbol => exportSymbol.getName()));

	let code = "";
	for (const moduleName of moduleNames) {
		program.emit(program.getSourceFile(moduleName), (file, data) => {
			// Skip declaration maps this time around
			if (file.endsWith(DECLARATION_MAP_EXTENSION)) return;
			code += `${data.replace(SOURCE_MAP_COMMENT_REGEXP, "")}\n`;
		}, undefined, true);
	}

	console.log(code);

	languageServiceHost.addFile({file: declarationBundleSourceFileName, code});

	code = "";
	let map: string|undefined;
	program = languageService.getProgram()!;

	program.emit(
		program.getSourceFile(declarationBundleSourceFileName),
		(file, data) => {
			if (file.endsWith(DECLARATION_MAP_EXTENSION)) map = data;
			else code += `${data.replace(SOURCE_MAP_COMMENT_REGEXP, "")}\n${generateMap ? `${SOURCE_MAP_COMMENT}=${declarationMapFilename}` : ``}`;
		},
		undefined,
		true,
		declarationTransformers(usedExports)
	);
	languageServiceHost.deleteFile(declarationBundleSourceFileName);

	return {
		sourceDescription: {
			code,
			map
		},
		declarationFilename,
		declarationMapFilename
	};
}