import {IEmitDeclarationsOptions} from "./i-emit-declarations-options";
import {flattenDeclarationsFromRollupChunk} from "../flatten-declarations-from-rollup-chunk/flatten-declarations-from-rollup-chunk";

/**
 * Emits declaration files based on the given options
 * @param {IEmitDeclarationsOptions} options
 */
export function emitDeclarations(options: IEmitDeclarationsOptions): void {
	// Generate declaration files for this chunk
	const {absoluteDeclarationMapFilename, absoluteDeclarationFilename, sourceDescription} = flattenDeclarationsFromRollupChunk(options);

	// Write it to disk
	options.fileSystem.writeFileSync(absoluteDeclarationFilename, sourceDescription.code);

	// If there is a SourceMap for the declarations, write them to disk too
	if (sourceDescription.map != null) {
		options.fileSystem.writeFileSync(absoluteDeclarationMapFilename, sourceDescription.map.toString());
	}
}
