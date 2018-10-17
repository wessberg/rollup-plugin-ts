import {DECLARATION_EXTENSION, DECLARATION_MAP_EXTENSION} from "../../constant/constant";
import {IFlattenDeclarationsFromRollupChunkOptions} from "./i-flatten-declarations-from-rollup-chunk-options";
import {IFlattenDeclarationsFromRollupChunkResult} from "./i-flatten-declarations-from-rollup-chunk-result";
import {setExtension} from "../path/path-util";
import {createProgram} from "typescript";

/**
 * Flattens all the modules that are part of the given chunk and returns a single SourceDescription for a flattened file
 * @param {IFlattenDeclarationsFromRollupChunkOptions} opts
 * @returns {SourceDescription}
 */
export function flattenDeclarationsFromRollupChunk ({chunk, options, compilerHost}: IFlattenDeclarationsFromRollupChunkOptions): IFlattenDeclarationsFromRollupChunkResult {

	// Create a program based on only those modules that are included in the chunk
	createProgram(Object.keys(chunk.modules), options, compilerHost)
		.emit(undefined, undefined, undefined, true);
	const {code, map} = compilerHost.lastValue;

	// The source file and map should be named the same as the chunk, except have declaration and declaration map extensions
	const sourceFilename = setExtension(chunk.fileName, DECLARATION_EXTENSION);
	const mapFilename = setExtension(chunk.fileName, DECLARATION_MAP_EXTENSION);

	return {
		sourceDescription: {code, map},
		declarationFilename: sourceFilename,
		declarationMapFilename: mapFilename
	};
}