import {IEmitDeclarationsOptions} from "./i-emit-declarations-options";
import {flattenDeclarationsFromRollupChunk} from "../flatten-declarations-from-rollup-chunk/flatten-declarations-from-rollup-chunk";
import {writeFileSync} from "../file-system/file-system";
import {join} from "path";
import {getDeclarationOutDir} from "../get-declaration-out-dir/get-declaration-out-dir";

/**
 * Emits declaration files based on the given options
 * @param {IEmitDeclarationsOptions} opts
 */
export function emitDeclarations ({chunk, compilerOptions, declarationCompilerOptions, cwd, outputOptions, compilerHost}: IEmitDeclarationsOptions): void {
	// Generate declaration files for this chunk
	const {declarationMapFilename, declarationFilename, sourceDescription} = flattenDeclarationsFromRollupChunk({chunk, options: declarationCompilerOptions, compilerHost});

	// Write it to disk
	writeFileSync(
		join(getDeclarationOutDir(cwd, compilerOptions, outputOptions), declarationFilename), sourceDescription.code);

	// If there is a SourceMap for the declarations, write them to disk too
	if (sourceDescription.map != null) {
		writeFileSync(join(getDeclarationOutDir(cwd, compilerOptions, outputOptions), declarationMapFilename), sourceDescription.map.toString());
	}
}