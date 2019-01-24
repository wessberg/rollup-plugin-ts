import {IEmitDeclarationsOptions} from "./i-emit-declarations-options";
import {flattenDeclarationsFromRollupChunk} from "../flatten-declarations-from-rollup-chunk/flatten-declarations-from-rollup-chunk";
import {writeFileSync} from "../file-system/file-system";

/**
 * Emits declaration files based on the given options
 * @param {IEmitDeclarationsOptions} options
 */
export function emitDeclarations(options: IEmitDeclarationsOptions): void {
	// Generate declaration files for this chunk
	const {absoluteDeclarationMapFilename, absoluteDeclarationFilename, sourceDescription} = flattenDeclarationsFromRollupChunk(options);

	// Write it to disk
	writeFileSync(absoluteDeclarationFilename, sourceDescription.code);

	// If there is a SourceMap for the declarations, write them to disk too
	if (sourceDescription.map != null) {
		writeFileSync(absoluteDeclarationMapFilename, sourceDescription.map.toString());
	}
}
